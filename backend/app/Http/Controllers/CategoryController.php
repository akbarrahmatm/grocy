<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryStoreRequest;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->categories->list($request->query('search')));
    }

    public function show(int $category): JsonResponse
    {
        return response()->json($this->categories->find($category));
    }

    public function store(CategoryStoreRequest $request): JsonResponse
    {
        return response()->json($this->categories->create($request->validated()), 201);
    }

    public function update(CategoryStoreRequest $request, int $category): JsonResponse
    {
        return response()->json($this->categories->update($category, $request->validated()));
    }

    public function destroy(int $category): JsonResponse
    {
        $this->categories->delete($category);

        return response()->json(['message' => 'Category deleted.']);
    }
}
