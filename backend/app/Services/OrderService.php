<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Integration;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use LogicException;
use Throwable;

class OrderService
{
    public function __construct(
        private readonly ShippingService $shipping,
    ) {}

    public function create(User $user, array $data): Order
    {
        $order = DB::transaction(function () use ($user, $data) {
            $address = Address::where('user_id', $user->id)->find($data['address_id']);

            if (! $address) {
                throw new ModelNotFoundException('Address not found.');
            }

            $lines = [];
            foreach ($data['items'] as $item) {
                $lines[(int) $item['product_id']] = ($lines[(int) $item['product_id']] ?? 0) + (int) $item['qty'];
            }

            $subtotal = 0;
            $snapshot = [];
            foreach ($lines as $productId => $qty) {
                $product = Product::query()->lockForUpdate()->findOrFail($productId);

                if ($product->stock < $qty) {
                    throw new LogicException("Insufficient stock for {$product->name}.");
                }

                $product->increment('stock', -$qty);

                $snapshot[] = ['product' => $product, 'qty' => $qty];
                $subtotal += (float) $product->price * $qty;
            }

            $shippingCost = 0;
            $courier = null;

            if (filled($data['courier']['code'] ?? null) && filled($data['courier']['service'] ?? null)) {
                $courier = $this->shipping->resolvePrice(
                    $address,
                    $data['items'],
                    $data['courier']['code'],
                    $data['courier']['service']
                );
                $shippingCost = $courier['price'];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'shipping_name' => $address->receiver_name,
                'shipping_phone' => $address->phone,
                'shipping_address' => $address->address,
                'shipping_city' => $address->city,
                'shipping_postal_code' => $address->postal_code,
                'shipping_latitude' => $address->latitude,
                'shipping_longitude' => $address->longitude,
                'courier_company' => $courier['company'] ?? null,
                'courier_code' => $courier['code'] ?? null,
                'courier_service' => $courier['service'] ?? null,
                'destination_id' => $address->destination_id,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $subtotal + $shippingCost,
                'note' => $data['note'] ?? null,
            ]);

            foreach ($snapshot as $line) {
                $product = $line['product'];
                $qty = $line['qty'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'qty' => $qty,
                    'subtotal' => (float) $product->price * $qty,
                ]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'out',
                    'qty' => $qty,
                    'ref_type' => 'order',
                    'ref_id' => $order->id,
                    'note' => 'Order '.$order->order_number,
                ]);
            }

            $this->issueSnapToken($order);

            return $order;
        });

        $this->pushToKomship($order);

        return $order->load('items');
    }

    /**
     * Registering the shipment must never block checkout — a Komship
     * outage only costs us the AWB, which can be pushed again later.
     */
    private function pushToKomship(Order $order): void
    {
        try {
            $this->shipping->storeOrder($order->loadMissing('items'));
        } catch (Throwable $e) {
            report($e);
        }
    }

    public function list(User $user, bool $admin): LengthAwarePaginator
    {
        return Order::query()
            ->when(! $admin, fn ($q) => $q->where('user_id', $user->id))
            ->with('user:id,name,email')
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function find(User $user, int $id, bool $admin): Order
    {
        $order = Order::query()
            ->when(! $admin, fn ($q) => $q->where('user_id', $user->id))
            ->with(['user:id,name,email', 'items'])
            ->find($id);

        if (! $order) {
            throw new ModelNotFoundException('Order not found.');
        }

        return $order;
    }

    public function handleMidtransNotification(array $payload): array
    {
        $orderNumber = $payload['order_id'] ?? null;
        $order = $orderNumber ? Order::where('order_number', $orderNumber)->first() : null;

        $serverKey = $this->midtransConfig()['server_key'] ?? '';
        $computed = hash('sha512', $orderNumber.$payload['status_code'].$payload['gross_amount'].$serverKey);
        $valid = isset($payload['signature_key']) && hash_equals($computed, (string) $payload['signature_key']);

        if (! $valid || ! $order) {
            return ['processed' => false, 'valid' => $valid];
        }

        $action = match ($payload['transaction_status'] ?? null) {
            'capture', 'settlement' => fn () => $this->markPaid($order),
            'deny', 'cancel', 'expire' => fn () => $this->markCancelled($order),
            default => null,
        };

        if ($action !== null) {
            $action();
            $order->refresh();
        }

        return ['processed' => true, 'valid' => true, 'status' => $order->status];
    }

    private function markPaid(Order $order): void
    {
        DB::transaction(function () use ($order) {
            if ($order->status !== 'pending') {
                return;
            }

            $order->status = 'paid';
            $order->paid_at = now();
            $order->save();
        });
    }

    private function markCancelled(Order $order): void
    {
        DB::transaction(function () use ($order) {
            if ($order->status !== 'pending') {
                return;
            }

            foreach ($order->items as $item) {
                Product::query()->lockForUpdate()->findOrFail($item->product_id)->increment('stock', $item->qty);

                StockMovement::create([
                    'product_id' => $item->product_id,
                    'type' => 'in',
                    'qty' => $item->qty,
                    'ref_type' => 'order',
                    'ref_id' => $order->id,
                    'note' => 'Order cancelled '.$order->order_number,
                ]);
            }

            $order->status = 'cancelled';
            $order->save();
        });
    }

    private function issueSnapToken(Order $order): void
    {
        $integration = Integration::where('provider', 'midtrans')->first();
        if (! $integration || ! $integration->is_active) {
            return;
        }

        $config = $integration->secrets();
        $base = $integration->environment === 'production'
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $res = Http::withBasicAuth($config['server_key'] ?? '', '')
            ->asJson()
            ->post($base, [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int) $order->total,
                ],
                'callbacks' => [
                    'finish' => rtrim(config('app.frontend_url'), '/').'/orders/'.$order->id.'/complete',
                ],
            ]);

        if ($res->failed()) {
            $message = $res->json('error_messages.0') ?? 'Failed to initialize payment ('.$res->status().').';
            throw new LogicException($message);
        }

        $order->snap_token = $res->json('token');
        $order->snap_redirect_url = $res->json('redirect_url');
        $order->save();
    }

    private function midtransConfig(): array
    {
        $integration = Integration::where('provider', 'midtrans')->first();

        return $integration ? $integration->secrets() : [];
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('YmdHis').'-'.strtoupper(Str::random(4));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}