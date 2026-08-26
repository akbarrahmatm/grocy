<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UomController;
use Illuminate\Support\Facades\Route;

Route::get('category', [CategoryController::class, 'index']);
Route::get('category/{category}', [CategoryController::class, 'show']);
Route::get('uom', [UomController::class, 'index']);
Route::get('uom/{uom}', [UomController::class, 'show']);
Route::get('product', [ProductController::class, 'index']);
Route::get('product/{product}', [ProductController::class, 'show']);
Route::get('webhook/products', [ProductController::class, 'all'])
    ->middleware('webhook.secret');

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('category', [CategoryController::class, 'store']);
    Route::put('category/{category}', [CategoryController::class, 'update']);
    Route::delete('category/{category}', [CategoryController::class, 'destroy']);
    Route::post('uom', [UomController::class, 'store']);
    Route::put('uom/{uom}', [UomController::class, 'update']);
    Route::delete('uom/{uom}', [UomController::class, 'destroy']);
    Route::post('product', [ProductController::class, 'store']);
    Route::put('product/{product}', [ProductController::class, 'update']);
    Route::delete('product/{product}', [ProductController::class, 'destroy']);
});
