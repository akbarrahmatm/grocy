<?php

namespace App\Http\Controllers;

use App\Models\WebhookLog;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentNotificationController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function midtrans(Request $request): JsonResponse
    {
        $payload = $request->all();

        $log = WebhookLog::create([
            'provider' => 'midtrans',
            'payload' => $payload,
        ]);

        $result = $this->orders->handleMidtransNotification($payload);

        $log->signature_valid = $result['valid'] ?? false;
        $log->processed = $result['processed'] ?? false;
        $log->error = ! ($result['valid'] ?? false) ? 'Invalid signature or order not found.' : null;
        $log->save();

        return response()->json(['message' => 'OK'], $result['valid'] ?? false ? 200 : 400);
    }
}