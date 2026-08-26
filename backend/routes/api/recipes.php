<?php

use App\Http\Controllers\RecipeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('recipe/suggest', [RecipeController::class, 'suggest']);
    // alias for legacy frontend path
    Route::post('recipe/search', [RecipeController::class, 'suggest']);
    Route::get('recipe/history', [RecipeController::class, 'history']);
    Route::get('recipe/history/{id}', [RecipeController::class, 'show']);
    Route::delete('recipe/history/{id}', [RecipeController::class, 'destroy']);
});
