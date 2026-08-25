<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/', [UserController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('user')->group(function () {
    Route::post('/', [UserController::class, 'store']);
});