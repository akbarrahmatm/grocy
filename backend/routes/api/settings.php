<?php

use App\Http\Controllers\IntegrationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('settings/gateways', [IntegrationController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('settings/gateways/{provider}', [IntegrationController::class, 'update'])
        ->whereIn('provider', ['midtrans', 'komship']);
    Route::post('settings/gateways/{provider}/test', [IntegrationController::class, 'test'])
        ->whereIn('provider', ['midtrans', 'komship']);
});