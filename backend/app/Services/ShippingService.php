<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Integration;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use LogicException;

class ShippingService
{
    private const GRAMS_PER_UNIT = 1000;

    /**
     * Komship destination search (their own area IDs are required for
     * tariff calculation and order creation).
     */
    public function destinations(string $keyword): array
    {
        if (mb_strlen(trim($keyword)) < 3) {
            return [];
        }

        $gateway = $this->gateway();

        $res = Http::withHeaders(['x-api-key' => $gateway['api_key']])
            ->acceptJson()
            ->get($gateway['base'].'/tariff/api/v1/destination/search', ['keyword' => trim($keyword)]);

        if ($res->failed()) {
            throw new LogicException($res->json('message') ?? 'Failed to search destinations ('.$res->status().').');
        }

        return collect($res->json('data') ?? [])
            ->filter(fn ($row) => is_array($row) && filled($row['destination_id'] ?? null))
            ->map(fn (array $row) => [
                'id' => (int) $row['destination_id'],
                'label' => collect([
                    $row['suburb'] ?? null,
                    $row['district'] ?? null,
                    $row['city'] ?? null,
                    $row['province'] ?? null,
                    filled($row['zip_code'] ?? null) ? (string) $row['zip_code'] : null,
                ])->filter()->implode(', '),
                'city' => (string) ($row['city'] ?? ''),
                'province' => (string) ($row['province'] ?? ''),
                'postal_code' => (string) ($row['zip_code'] ?? ''),
            ])
            ->unique('id')
            ->values()
            ->all();
    }

    /**
     * Tariff options for a destination address. Weight is rounded up to
     * whole kilograms (Komship unit), flat 1kg per carton of goods.
     */
    public function rates(Address $address, array $items): array
    {
        $gateway = $this->gateway();

        if (blank($address->destination_id)) {
            throw new LogicException('Selected address has no delivery area. Edit the address and pick one.');
        }

        $totalGrams = collect($items)->sum(fn (array $item) => self::GRAMS_PER_UNIT * (int) $item['qty']);
        $itemValue = (int) Product::whereIn('id', collect($items)->pluck('product_id'))
            ->get(['id', 'price'])
            ->sum(fn (Product $p) => (float) $p->price * (int) (collect($items)->firstWhere('product_id', $p->id)['qty'] ?? 0));

        $params = [
            'shipper_destination_id' => (int) $gateway['config']['origin_destination_id'],
            'receiver_destination_id' => (int) $address->destination_id,
            'weight' => max(1, (int) ceil($totalGrams / 1000)),
            'item_value' => $itemValue,
            'cod' => 'no',
        ];

        if (filled($gateway['config']['origin_latitude'] ?? null) && filled($gateway['config']['origin_longitude'] ?? null)) {
            $params['origin_pin_point'] = $gateway['config']['origin_latitude'].','.$gateway['config']['origin_longitude'];
        }
        if (filled($address->latitude) && filled($address->longitude)) {
            $params['destination_pin_point'] = $address->latitude.','.$address->longitude;
        }

        $res = Http::withHeaders(['x-api-key' => $gateway['api_key']])
            ->acceptJson()
            ->get($gateway['base'].'/tariff/api/v1/calculate', $params);

        if ($res->failed()) {
            throw new LogicException($res->json('message') ?? 'Failed to fetch shipping rates ('.$res->status().').');
        }

        $payload = $res->json();
        $tariffs = data_get($payload, 'data.tariffs') ?? data_get($payload, 'data') ?? [];

        return collect(is_array($tariffs) ? $tariffs : [])
            ->filter(fn ($t) => is_array($t) && isset($t['shipping_cost']) && filled($t['code'] ?? null))
            ->map(fn (array $t) => [
                'company' => (string) ($t['shipping_name'] ?? $t['code']),
                'code' => strtoupper((string) $t['code']),
                'service' => (string) ($t['service'] ?? ''),
                'description' => (string) ($t['description'] ?? ''),
                'price' => (int) $t['shipping_cost'],
                'etd' => (string) ($t['etd'] ?? ''),
            ])
            ->values()
            ->all();
    }

    /**
     * Re-fetch rates and return the authoritative option for the chosen
     * courier. The client-selected rate is never trusted.
     *
     * @return array{company: string, code: string, service: string, price: int}
     */
    public function resolvePrice(Address $address, array $items, string $code, string $service): array
    {
        $rate = collect($this->rates($address, $items))
            ->first(fn (array $rate) => $rate['code'] === strtoupper($code) && $rate['service'] === $service)
            ?? throw new LogicException('Selected shipping rate is no longer available.');

        return [
            'company' => $rate['company'],
            'code' => $rate['code'],
            'service' => $rate['service'],
            'price' => $rate['price'],
        ];
    }

    /**
     * Register the shipment with Komship to obtain an order number/AWB.
     */
    public function storeOrder(Order $order): void
    {
        if (blank($order->destination_id) || blank($order->courier_code)) {
            return;
        }

        $gateway = $this->gateway();
        $config = $gateway['config'];

        $res = Http::withHeaders(['x-api-key' => $gateway['api_key']])
            ->acceptJson()
            ->asJson()
            ->post($gateway['base'].'/order/api/v1/orders/store', [
                'order_date' => $order->created_at?->format('Y-m-d H:i:s') ?? now()->format('Y-m-d H:i:s'),
                'brand_name' => $config['brand_name'] ?? config('app.name'),
                'shipper_name' => $config['shipper_name'] ?? config('app.name'),
                'shipper_phone' => $config['shipper_phone'] ?? '',
                'shipper_destination_id' => (int) $config['origin_destination_id'],
                'shipper_address' => $config['origin_address'] ?? '',
                'receiver_name' => $order->shipping_name,
                'receiver_phone' => $order->shipping_phone,
                'receiver_destination_id' => (int) $order->destination_id,
                'receiver_address' => collect([
                    $order->shipping_address,
                    $order->shipping_city,
                    $order->shipping_postal_code,
                ])->filter()->implode(', '),
                ...(filled($config['origin_latitude'] ?? null) && filled($config['origin_longitude'] ?? null)
                    ? ['origin_pin_point' => $config['origin_latitude'].','.$config['origin_longitude']]
                    : []),
                ...(filled($order->shipping_latitude) && filled($order->shipping_longitude)
                    ? ['destination_pin_point' => $order->shipping_latitude.','.$order->shipping_longitude]
                    : []),
                'shipping' => $order->courier_code,
                'shipping_type' => $order->courier_service,
                'payment_method' => 'BANK TRANSFER',
                'shipping_cost' => (int) $order->shipping_cost,
                'grand_total' => (int) $order->total,
                'cod_value' => 0,
                'insurance_value' => 0,
                'notes' => $order->note,
                'order_details' => $order->items->map(fn ($item) => [
                    'product_name' => $item->name,
                    'product_price' => (int) $item->price,
                    'product_weight' => self::GRAMS_PER_UNIT * $item->qty,
                    'qty' => $item->qty,
                    'subtotal' => (int) $item->subtotal,
                ])->all(),
            ]);

        if ($res->failed()) {
            throw new LogicException($res->json('message') ?? 'Failed to register shipment ('.$res->status().').');
        }

        $order->forceFill([
            'komship_order_no' => $res->json('data.order_no'),
            'airway_bill' => $res->json('data.airway_bill'),
        ])->save();
    }

    /**
     * @return array{config: array, api_key: string, base: string}
     */
    private function gateway(): array
    {
        $integration = Integration::where('provider', 'komship')->first();

        if (! $integration || ! $integration->is_active) {
            throw new LogicException('Shipping gateway is not configured.');
        }

        $config = $integration->secrets();

        if (blank($config['api_key'] ?? null) || blank($config['origin_destination_id'] ?? null)) {
            throw new LogicException('Shipping gateway is not configured.');
        }

        return [
            'config' => $config,
            'api_key' => $config['api_key'],
            'base' => $integration->environment === 'production'
                ? 'https://collaborator.komerce.id'
                : 'https://api-sandbox.collaborator.komerce.id',
        ];
    }
}
