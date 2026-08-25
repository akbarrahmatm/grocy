<?php

namespace App\Http\Controllers;

use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function __construct(private readonly StockService $stock) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->stock->listMovements($request->query('search')));
    }
}