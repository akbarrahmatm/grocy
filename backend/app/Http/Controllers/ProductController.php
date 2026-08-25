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

    public function show(int $product): JsonResponse
    {
        return response()->json($this->products->find($product));
    }

    public function store(ProductStoreRequest $request): JsonResponse
    {
        return response()->json($this->products->create($request->validated()), 201);
    }

    public function update(ProductStoreRequest $request, int $product): JsonResponse
    {
        return response()->json($this->products->update($product, $request->validated()));
    }

    public function destroy(int $product): JsonResponse
    {
        $this->products->delete($product);

        return response()->json(['message' => 'Product deleted.']);
    }
}
