<?php

namespace App\Services;

use App\Models\Integration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class IntegrationService
{
    public function ensureDefaults(): void
    {
        foreach (['midtrans', 'biteship'] as $provider) {
            Integration::firstOrCreate(
                ['provider' => $provider],
                ['environment' => 'sandbox', 'is_active' => false]
            );
        }
    }

    public function save(string $provider, array $data): Integration
    {
        $integration = Integration::firstOrCreate(
            ['provider' => $provider],
            ['environment' => 'sandbox', 'is_active' => false]
        );

        $config = array_merge($integration->config ?? [], $data['config'] ?? []);
        foreach (Integration::SECRET_KEYS[$provider] ?? [] as $key) {
            $value = $config[$key] ?? null;
            if ($value === null || $value === '') {
                unset($config[$key]);
            } elseif (! str_contains((string) $value, '•')) {
                $config[$key] = Crypt::encryptString($value);
            }
        }

        $integration->environment = $data['environment'] ?? $integration->environment;
        $integration->is_active = $data['is_active'] ?? $integration->is_active;
        $integration->config = $config ?: null;
        $integration->save();

        return $integration;
    }

    public function test(string $provider, array $data): array
    {
        $existing = Integration::where('provider', $provider)->first()?->config ?? [];
        $config = array_merge($existing, $data['config'] ?? []);
        $environment = $data['environment'] ?? 'sandbox';

        foreach (Integration::SECRET_KEYS[$provider] ?? [] as $key) {
            $value = $config[$key] ?? null;
            if ($value !== null && str_contains((string) $value, '•')) {
                $existingValue = $existing[$key] ?? null;
                $config[$key] = $existingValue !== null
                    ? Crypt::decryptString($existingValue)
                    : null;
            }
        }

        return match ($provider) {
            'midtrans' => $this->testMidtrans($config, $environment),
            'biteship' => $this->testBiteship($config, $environment),
            default => throw new InvalidArgumentException('Unknown provider.'),
        };
    }

    private function testMidtrans(array $config, string $environment): array
    {
        $serverKey = $config['server_key'] ?? '';
        if ($serverKey === '' || str_contains($serverKey, '•')) {
            return ['ok' => false, 'message' => 'Server key is required.'];
        }

        $base = $environment === 'production'
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $res = Http::withBasicAuth($serverKey, '')
            ->asJson()
            ->post($base, [
                'transaction_details' => [
                    'order_id' => 'test-' . uniqid(),
                    'gross_amount' => 1,
                ],
            ]);

        return $res->successful()
            ? ['ok' => true, 'message' => 'Midtrans connected.']
            : ['ok' => false, 'message' => $res->json('error_messages.0') ?? 'Connection failed (' . $res->status() . ').'];
    }

    private function testBiteship(array $config, string $environment): array
    {
        $apiKey = $config['api_key'] ?? '';
        if ($apiKey === '' || str_contains($apiKey, '•')) {
            return ['ok' => false, 'message' => 'API key is required.'];
        }

        $res = Http::withHeaders(['Authorization' => $apiKey])
            ->asJson()
            ->send('GET', 'https://api.biteship.com/v1/couriers', [
                'json' => [
                    'origin_latitude' => '-6.291974',
                    'origin_longitude' => '106.801207',
                    'destination_latitude' => '-6.288941',
                    'destination_longitude' => '106.806473',
                    'couriers' => 'grab,gojek',
                ],
            ]);

        return $res->successful()
            ? ['ok' => true, 'message' => 'Biteship connected.']
            : ['ok' => false, 'message' => $res->json('message') ?? 'Connection failed (' . $res->status() . ').'];
    }
}
