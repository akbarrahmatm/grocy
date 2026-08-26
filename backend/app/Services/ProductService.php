<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    public function list(?string $search = null, ?int $categoryId = null): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category:id,name', 'uom:id,name,code'])
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->orderByRaw('stock <= 0')
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function all(): EloquentCollection
    {
        return Product::query()
            ->with(['category:id,name', 'uom:id,name,code'])
            ->orderBy('name')
            ->get();
    }

    public function find(int $id): Product
    {
        return Product::with('category:id,name', 'uom:id,name,code')->findOrFail($id);
    }

    public function create(array $data): Product
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['sku'] = $data['sku'] ?? $this->generateSku();
        $data['thumbnail'] = $this->storeThumbnail($data['thumbnail'] ?? null);

        return Product::create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = $this->find($id);

        if (array_key_exists('thumbnail', $data)) {
            $data['thumbnail'] = $this->storeThumbnail($data['thumbnail'], $product->thumbnail);
        }

        $product->update($data);

        return $product;
    }

    public function delete(int $id): void
    {
        $product = $this->find($id);
        $this->deleteThumbnailFile($product->thumbnail);
        $product->delete();
    }

    private function storeThumbnail(mixed $thumbnail, ?string $previous = null): ?string
    {
        if (! $thumbnail instanceof UploadedFile) {
            if ($thumbnail === null && $previous !== null) {
                $this->deleteThumbnailFile($previous);
            }

            return $thumbnail;
        }

        $path = $thumbnail->store('products', 'public');

        if ($previous !== null && $previous !== $path) {
            $this->deleteThumbnailFile($previous);
        }

        return $path;
    }

    private function deleteThumbnailFile(?string $path): void
    {
        if ($path !== null && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function generateSku(): string
    {
        do {
            $sku = 'SKU-'.strtoupper(Str::random(8));
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }
}
