<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AddressService
{
    public function list(User $user)
    {
        return Address::where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(User $user, array $data): Address
    {
        return DB::transaction(function () use ($user, $data) {
            $data['user_id'] = $user->id;
            $data['is_default'] ??= Address::where('user_id', $user->id)->doesntExist();

            if ($data['is_default']) {
                Address::where('user_id', $user->id)->update(['is_default' => false]);
            }

            return Address::create($data);
        });
    }

    public function update(User $user, int $id, array $data): Address
    {
        return DB::transaction(function () use ($user, $id, $data) {
            $address = $this->findOrFail($user, $id);

            if (! empty($data['is_default'])) {
                Address::where('user_id', $user->id)->where('id', '!=', $id)->update(['is_default' => false]);
            }

            $address->update($data);

            return $address;
        });
    }

    public function delete(User $user, int $id): void
    {
        DB::transaction(function () use ($user, $id) {
            $address = $this->findOrFail($user, $id);
            $wasDefault = $address->is_default;
            $address->delete();

            if ($wasDefault) {
                Address::where('user_id', $user->id)
                    ->latest()
                    ->first()
                    ?->update(['is_default' => true]);
            }
        });
    }

    private function findOrFail(User $user, int $id): Address
    {
        $address = Address::where('user_id', $user->id)->find($id);

        if (! $address) {
            throw new ModelNotFoundException('Address not found.');
        }

        return $address;
    }
}