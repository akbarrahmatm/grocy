<?php

namespace App\Http\Controllers;

use App\Http\Requests\CartItemRequest;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(Request $request): JsonResponse
    {
        $this->ensureCustomer($request->user());

        return response()->json($this->cart->list($request->user()));
    }

    public function store(CartItemRequest $request): JsonResponse
    {
        $this->ensureCustomer($request->user());

        $item = $this->cart->add($request->user(), $request->input('product_id'), $request->input('qty'));

        return response()->json($item, 201);
    }

    public function update(int $cart, CartItemRequest $request): JsonResponse
    {
        $this->ensureCustomer($request->user());

        return response()->json($this->cart->update($request->user(), $cart, $request->input('qty')));
    }

    public function destroy(int $cart, Request $request): JsonResponse
    {
        $this->ensureCustomer($request->user());
        $this->cart->remove($request->user(), $cart);

        return response()->json(['message' => 'Cart item removed.']);
    }

    private function ensureCustomer(User $user): void
    {
        if (! $user->is_customer) {
            throw new HttpException(403, 'Forbidden.');
        }
    }
}