<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\StockMovementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('inventory/stock', [ProductController::class, 'index']);
    Route::get('inventory/stock-adjustment', [StockAdjustmentController::class, 'index']);
    Route::post('inventory/stock-adjustment', [StockAdjustmentController::class, 'store']);
    Route::get('inventory/stock-movement', [StockMovementController::class, 'index']);
});