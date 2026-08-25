<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockAdjustmentRequest;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use LogicException;

class StockAdjustmentController extends Controller
{
    public function __construct(private readonly StockService $stock) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->stock->listAdjustments($request->query('search')));
    }

    public function store(StockAdjustmentRequest $request): JsonResponse
    {
        try {
            return response()->json($this->stock->adjust($request->validated()), 201);
        } catch (LogicException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}