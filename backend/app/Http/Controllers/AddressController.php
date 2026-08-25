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

    public function update(int $id, AddressStoreRequest $request): JsonResponse
    {
        return response()->json($this->addresses->update($request->user(), $id, $request->validated()));
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $this->addresses->delete($request->user(), $id);

        return response()->json(['message' => 'Address deleted.']);
    }
}