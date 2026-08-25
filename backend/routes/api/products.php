<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UomController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('category', CategoryController::class);
    Route::apiResource('uom', UomController::class);
    Route::apiResource('product', ProductController::class);
});
