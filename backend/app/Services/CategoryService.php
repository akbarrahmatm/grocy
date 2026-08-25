<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class CategoryService
{
    public function list(?string $search = null): LengthAwarePaginator
    {
        return Category::query()
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%"))
            ->withCount('products')
            ->paginate(15);
    }

    public function find(int $id): Category
    {
        return Category::withCount('products')->findOrFail($id);
    }

    public function create(array $data): Category
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return Category::create($data);
    }

    public function update(int $id, array $data): Category
    {
        $category = $this->find($id);
        $category->update($data);

        return $category;
    }

    public function delete(int $id): void
    {
        $this->find($id)->delete();
    }
}
