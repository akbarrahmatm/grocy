<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

#[Fillable(['provider', 'is_active', 'environment', 'config'])]
class Integration extends Model
{
    use HasFactory;

    public const SECRET_KEYS = [
        'midtrans' => ['server_key'],
        'komship' => ['api_key'],
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array',
    ];

    public function secrets(): array
    {
        $config = $this->config ?? [];

        foreach (self::SECRET_KEYS[$this->provider] ?? [] as $key) {
            if (! empty($config[$key])) {
                $config[$key] = Crypt::decryptString($config[$key]);
            }
        }

        return $config;
    }

    public function masked(): array
    {
        $config = $this->config ?? [];

        foreach (self::SECRET_KEYS[$this->provider] ?? [] as $key) {
            if (! empty($config[$key])) {
                $config[$key] = $this->mask(Crypt::decryptString($config[$key]));
            }
        }

        return $config;
    }

    private function mask(string $value): string
    {
        return strlen($value) <= 8 ? '••••••••' : '••••••••'.substr($value, -4);
    }
}