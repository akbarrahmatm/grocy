<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentNotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('address', AddressController::class)->except(['show']);
    Route::apiResource('cart', CartController::class)->except(['show']);
    Route::get('order', [OrderController::class, 'index']);
    Route::post('order', [OrderController::class, 'store']);
    Route::get('order/{order}', [OrderController::class, 'show']);
});

Route::post('payment/notification/midtrans', [PaymentNotificationController::class, 'midtrans']);