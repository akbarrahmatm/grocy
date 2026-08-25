<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use LogicException;

class StockService
{
    public function adjust(array $data): StockAdjustment
    {
        return DB::transaction(function () use ($data) {
            $product = Product::query()->lockForUpdate()->findOrFail($data['product_id']);
            $qty = (int) $data['qty'];
            $delta = $data['type'] === 'in' ? $qty : -$qty;

            if ($product->stock + $delta < 0) {
                throw new LogicException('Insufficient stock.');
            }

            $product->increment('stock', $delta);

            $adjustment = StockAdjustment::create($data);

            StockMovement::create([
                'product_id' => $product->id,
                'type' => $data['type'],
                'qty' => $qty,
                'ref_type' => 'adjustment',
                'ref_id' => $adjustment->id,
                'note' => $data['note'] ?? null,
            ]);

            return $adjustment;
        });
    }

    public function listAdjustments(?string $search = null): LengthAwarePaginator
    {
        return StockAdjustment::query()
            ->with('product:id,name,sku')
            ->when($search, fn ($q) => $q->whereHas('product', fn ($p) => $p
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function listMovements(?string $search = null): LengthAwarePaginator
    {
        return StockMovement::query()
            ->with('product:id,name,sku')
            ->when($search, fn ($q) => $q->where(fn ($q2) => $q2
                ->whereHas('product', fn ($p) => $p
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%"))
                ->orWhere('note', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->paginate(15);
    }
}