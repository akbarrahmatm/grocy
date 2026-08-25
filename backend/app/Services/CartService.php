<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CartService
{
    public function list(User $user): Collection
    {
        return CartItem::where('user_id', $user->id)
            ->with([
                'product:id,name,sku,price,stock,uom_id,thumbnail',
                'product.uom:id,name,code',
            ])
            ->orderByDesc('created_at')
            ->get();
    }

    public function add(User $user, int $productId, int $qty): CartItem
    {
        return DB::transaction(function () use ($user, $productId, $qty) {
            $product = Product::query()->lockForUpdate()->findOrFail($productId);

            $inCart = (int) CartItem::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->value('qty');

            if ($product->stock < $inCart + $qty) {
                throw new HttpException(422, "Only {$product->stock} in stock for {$product->name}.");
            }

            if ($item = CartItem::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first()) {
                $item->increment('qty', $qty);
            } else {
                $item = CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'qty' => $qty,
                ]);
            }

            return $item->refresh()->load([
                'product:id,name,sku,price,stock,uom_id,thumbnail',
                'product.uom:id,name,code',
            ]);
        });
    }

    public function update(User $user, int $id, int $qty): CartItem
    {
        return DB::transaction(function () use ($user, $id, $qty) {
            $item = CartItem::where('user_id', $user->id)->lockForUpdate()->find($id);

            if (! $item) {
                throw new ModelNotFoundException('Cart item not found.');
            }

            $product = Product::query()->lockForUpdate()->findOrFail($item->product_id);

            if ($product->stock < $qty) {
                throw new HttpException(422, "Only {$product->stock} in stock for {$product->name}.");
            }

            $item->update(['qty' => $qty]);

            return $item->load([
                'product:id,name,sku,price,stock,uom_id,thumbnail',
                'product.uom:id,name,code',
            ]);
        });
    }

    public function remove(User $user, int $id): void
    {
        $this->findOrFail($user, $id)->delete();
    }

    public function clearByProducts(User $user, array $productIds): void
    {
        CartItem::where('user_id', $user->id)
            ->whereIn('product_id', $productIds)
            ->delete();
    }

    private function findOrFail(User $user, int $id): CartItem
    {
        $item = CartItem::where('user_id', $user->id)->find($id);

        if (! $item) {
            throw new ModelNotFoundException('Cart item not found.');
        }

        return $item;
    }
}
