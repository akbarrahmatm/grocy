<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderCreateRequest;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use LogicException;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly CartService $cart,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $admin = ! (bool) $request->user()->is_customer;

        return response()->json($this->orders->list($request->user(), $admin));
    }

    public function store(OrderCreateRequest $request): JsonResponse
    {
        try {
            $order = $this->orders->create($request->user(), $request->validated());

            $this->cart->clearByProducts(
                $request->user(),
                $order->items->pluck('product_id')->all()
            );

            return response()->json($order, 201);
        } catch (LogicException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(int $order, Request $request): JsonResponse
    {
        $admin = ! (bool) $request->user()->is_customer;

        return response()->json($this->orders->find($request->user(), $order, $admin));
    }
}