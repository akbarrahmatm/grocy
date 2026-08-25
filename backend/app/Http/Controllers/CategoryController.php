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

    public function show(int $id): JsonResponse
    {
        return response()->json($this->categories->find($id));
    }

    public function store(CategoryStoreRequest $request): JsonResponse
    {
        return response()->json($this->categories->create($request->validated()), 201);
    }

    public function update(CategoryStoreRequest $request, int $id): JsonResponse
    {
        return response()->json($this->categories->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->categories->delete($id);

        return response()->json(['message' => 'Category deleted.']);
    }
}
