<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IntegrationUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $provider = $this->route('provider') ?? $this->input('provider');

        $rules = [
            'environment' => ['sometimes', 'in:sandbox,production'],
            'is_active' => ['sometimes', 'boolean'],
            'config' => ['sometimes', 'array'],
        ];

        if ($provider === 'midtrans') {
            $rules['config.server_key'] = ['sometimes', 'string'];
            $rules['config.client_key'] = ['sometimes', 'string'];
        } elseif ($provider === 'biteship') {
            $rules['config.api_key'] = ['sometimes', 'string'];
        }

        return $rules;
    }
}