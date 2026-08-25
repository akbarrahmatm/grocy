<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddressStoreRequest;
use App\Services\AddressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function __construct(private readonly AddressService $addresses) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->addresses->list($request->user()));
    }

    public function store(AddressStoreRequest $request): JsonResponse
    {
        return response()->json($this->addresses->create($request->user(), $request->validated()), 201);
    }

    public function update(int $address, AddressStoreRequest $request): JsonResponse
    {
        return response()->json($this->addresses->update($request->user(), $address, $request->validated()));
    }

    public function destroy(int $address, Request $request): JsonResponse
    {
        $this->addresses->delete($request->user(), $address);

        return response()->json(['message' => 'Address deleted.']);
    }
}