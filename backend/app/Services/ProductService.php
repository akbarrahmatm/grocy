<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProductService
{
    public function list(?string $search = null): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category:id,name', 'uom:id,name,code'])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"))
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function find(int $id): Product
    {
        return Product::with('category:id,name', 'uom:id,name,code')->findOrFail($id);
    }

    public function create(array $data): Product
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['sku'] = $data['sku'] ?? $this->generateSku();

        return Product::create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = $this->find($id);
        $product->update($data);

        return $product;
    }

    public function delete(int $id): void
    {
        $this->find($id)->delete();
    }

    private function generateSku(): string
    {
        do {
            $sku = 'SKU-'.strtoupper(Str::random(8));
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }
}
