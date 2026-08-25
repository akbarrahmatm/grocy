<?php

namespace App\Services;

use App\Models\Uom;
use Illuminate\Pagination\LengthAwarePaginator;

class UomService
{
    public function list(?string $search = null): LengthAwarePaginator
    {
        return Uom::query()
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%"))
            ->withCount('products')
            ->paginate(15);
    }

    public function find(int $id): Uom
    {
        return Uom::withCount('products')->findOrFail($id);
    }

    public function create(array $data): Uom
    {
        return Uom::create($data);
    }

    public function update(int $id, array $data): Uom
    {
        $uom = $this->find($id);
        $uom->update($data);

        return $uom;
    }

    public function delete(int $id): void
    {
        $this->find($id)->delete();
    }
}
