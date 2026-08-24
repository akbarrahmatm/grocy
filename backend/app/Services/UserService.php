<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function listUsers(?string $role = null, ?string $search = null): LengthAwarePaginator
    {
        return User::query()
            ->when($role === 'admin', fn ($q) => $q->where('is_customer', 0))
            ->when($role === 'customer', fn ($q) => $q->where('is_customer', 1))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(15);
    }

    public function createUser(array $validated): User
    {
        return User::create($validated);
    }
}
