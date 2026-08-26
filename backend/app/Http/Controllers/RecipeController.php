<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\RecipeHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecipeController extends Controller
{
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dish' => ['required', 'string', 'max:255'],
            'query' => ['sometimes', 'string', 'max:255'],
        ]);

        $dish = $validated['dish'] ?? $validated['query'] ?? null;

        if (! $dish) {
            return response()->json(['message' => 'Dish is required.'], 422);
        }

        $secret = config('services.webhook.secret');
        if (! is_string($secret) || $secret === '') {
            Log::error('PRODUCT_WEBHOOK_SECRET not configured');
            return response()->json(['message' => 'Recipe service not configured.'], 500);
        }

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $secret,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->connectTimeout(10)->timeout(60)->retry(1, 500)->post('https://workflow.akbarrahmatm.my.id/webhook/ai-recipe', [
                'dish' => $dish,
            ]);
        } catch (\Throwable $e) {
            // ConnectionException = n8n/Sumopod lama -> Safari akan lihat TypeError Failed to fetch kalau tidak di-handle
            $isTimeout = str_contains($e->getMessage(), 'timed out') || str_contains($e->getMessage(), 'cURL error 28');
            Log::error('Recipe webhook exception', ['error' => $e->getMessage(), 'timeout' => $isTimeout]);
            return response()->json([
                'message' => $isTimeout ? 'Recipe AI is taking too long. Please retry.' : 'Recipe service unavailable.',
            ], 504);
        }

        if (! $response->successful()) {
            Log::warning('Recipe webhook failed', ['status' => $response->status(), 'body' => $response->body()]);
            // n8n kadang timeout → 504 gateway, forward as 504 biar Safari tidak bingung dengan 502 abadi
            $status = $response->status();
            if ($status === 504 || $status === 524) {
                return response()->json(['message' => 'Recipe AI is taking too long. Please retry.'], 504);
            }
            return response()->json([
                'message' => 'Failed to analyze recipe.',
                'details' => $response->json() ?? $response->body(),
            ], $status >= 400 && $status < 500 ? $status : 502);
        }

        $data = $response->json();

        // Enrich available_items with full Product models (price, thumbnail, etc.)
        $available = $data['available_items'] ?? [];
        $ids = collect($available)->pluck('id')->filter()->values()->all();

        $productsById = collect();
        if (! empty($ids)) {
            $productsById = Product::with(['category:id,name', 'uom:id,name,code'])
                ->whereIn('id', $ids)
                ->get()
                ->keyBy('id');
        }

        $enrichedAvailable = collect($available)->map(function ($item) use ($productsById) {
            $id = $item['id'] ?? null;
            if ($id && $productsById->has($id)) {
                $product = $productsById->get($id);
                return array_merge($item, [
                    'product' => $product,
                ]);
            }
            return $item;
        })->values();

        // Also provide legacy `products` key for backward compatibility
        $products = $productsById->values();

        $payload = [
            'dish' => $data['dish'] ?? $dish,
            'products' => $products,
            'available_items' => $enrichedAvailable,
            'unavailable_items' => $data['unavailable_items'] ?? [],
            'additional_items' => $data['additional_items'] ?? [],
            'recipe' => $data['recipe'] ?? [],
            'total_items' => $data['total_items'] ?? $products->count(),
        ];

        // Save history for authenticated user
        try {
            $history = RecipeHistory::create([
                'user_id' => $request->user()->id,
                'dish' => $payload['dish'],
                'total_items' => $payload['total_items'],
                'available_items' => $payload['available_items']->toArray(),
                'unavailable_items' => $payload['unavailable_items'],
                'additional_items' => $payload['additional_items'],
                'recipe' => $payload['recipe'],
            ]);
            $payload['history_id'] = $history->id;
        } catch (\Throwable $e) {
            Log::warning('Failed to save recipe history', ['error' => $e->getMessage()]);
        }

        return response()->json($payload);
    }

    public function history(Request $request): JsonResponse
    {
        $histories = RecipeHistory::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($histories);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $history = RecipeHistory::where('user_id', $request->user()->id)->findOrFail($id);

        // Re-hydrate products for available_items
        $available = $history->available_items ?? [];
        $ids = collect($available)->pluck('id')->filter()->values()->all();
        $productsById = collect();
        if (! empty($ids)) {
            $productsById = Product::with(['category:id,name', 'uom:id,name,code'])
                ->whereIn('id', $ids)
                ->get()
                ->keyBy('id');
        }
        $products = $productsById->values();

        return response()->json([
            'id' => $history->id,
            'dish' => $history->dish,
            'products' => $products,
            'available_items' => $history->available_items,
            'unavailable_items' => $history->unavailable_items,
            'additional_items' => $history->additional_items,
            'recipe' => $history->recipe,
            'total_items' => $history->total_items,
            'created_at' => $history->created_at,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $history = RecipeHistory::where('user_id', $request->user()->id)->findOrFail($id);
        $history->delete();

        return response()->json(['message' => 'History deleted.']);
    }
}
