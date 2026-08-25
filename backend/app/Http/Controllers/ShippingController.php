<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShippingRatesRequest;
use App\Models\Address;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use LogicException;

class ShippingController extends Controller
{
    public function destinations(Request $request, ShippingService $shipping): JsonResponse
    {
        try {
            return response()->json(['data' => $shipping->destinations((string) $request->query('q', ''))]);
        } catch (LogicException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function rates(ShippingRatesRequest $request, ShippingService $shipping): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($request->validated('address_id'));

        try {
            return response()->json(['data' => $shipping->rates($address, $request->validated('items'))]);
        } catch (LogicException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
