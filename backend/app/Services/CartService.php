<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CartService
{
    public function list(User $user): Collection
    {
        return CartItem::where('user_id', $user->id)
            ->with('product:id,name,sku,price,stock,uom_id')
            ->orderByDesc('created_at')
            ->get();
    }

    public function add(User $user, int $productId, int $qty): CartItem
    {
        return DB::transaction(function () use ($user, $productId, $qty) {
            Product::query()->lockForUpdate()->findOrFail($productId);

            $item = CartItem::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            if ($item) {
                $item->increment('qty', $qty);

                return $item->refresh();
            }

            return CartItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'qty' => $qty,
            ]);
        });
    }

    public function update(User $user, int $id, int $qty): CartItem
    {
        $item = $this->findOrFail($user, $id);
        $item->update(['qty' => $qty]);

        return $item;
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