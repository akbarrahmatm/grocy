<?php

namespace App\Http\Controllers;

use App\Http\Requests\UomStoreRequest;
use App\Services\UomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UomController extends Controller
{
    public function __construct(private readonly UomService $uoms) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->uoms->list($request->query('search')));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->uoms->find($id));
    }

    public function store(UomStoreRequest $request): JsonResponse
    {
        return response()->json($this->uoms->create($request->validated()), 201);
    }

    public function update(UomStoreRequest $request, int $id): JsonResponse
    {
        return response()->json($this->uoms->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->uoms->delete($id);

        return response()->json(['message' => 'UOM deleted.']);
    }
}
