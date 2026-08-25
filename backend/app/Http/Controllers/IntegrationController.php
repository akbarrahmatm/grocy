<?php

namespace App\Http\Controllers;

use App\Http\Requests\IntegrationUpdateRequest;
use App\Models\Integration;
use App\Services\IntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    public function __construct(private readonly IntegrationService $integrations) {}

    public function index(Request $request): JsonResponse
    {
        $this->integrations->ensureDefaults();

        return response()->json(
            Integration::orderBy('id')->get()->map(fn (Integration $i) => [
                'provider' => $i->provider,
                'is_active' => $i->is_active,
                'environment' => $i->environment,
                'config' => $i->masked(),
            ])
        );
    }

    public function update(string $provider, IntegrationUpdateRequest $request): JsonResponse
    {
        $this->integrations->ensureDefaults();
        $integration = $this->integrations->save($provider, $request->validated());

        return response()->json([
            'provider' => $integration->provider,
            'is_active' => $integration->is_active,
            'environment' => $integration->environment,
            'config' => $integration->masked(),
        ]);
    }

    public function test(string $provider, IntegrationUpdateRequest $request): JsonResponse
    {
        return response()->json($this->integrations->test($provider, $request->validated()));
    }
}