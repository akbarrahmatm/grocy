<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->products->list($request->query('search')));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->products->find($id));
    }

    public function store(ProductStoreRequest $request): JsonResponse
    {
        return response()->json($this->products->create($request->validated()), 201);
    }

    public function update(ProductStoreRequest $request, int $id): JsonResponse
    {
        return response()->json($this->products->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->products->delete($id);

        return response()->json(['message' => 'Product deleted.']);
    }
}
