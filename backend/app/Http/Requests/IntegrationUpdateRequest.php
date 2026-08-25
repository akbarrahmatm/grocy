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
        } elseif ($provider === 'komship') {
            $rules['config.api_key'] = ['sometimes', 'string'];
            $rules['config.brand_name'] = ['sometimes', 'nullable', 'string', 'max:100'];
            $rules['config.shipper_name'] = ['sometimes', 'nullable', 'string', 'max:255'];
            $rules['config.shipper_phone'] = ['sometimes', 'nullable', 'string', 'max:20'];
            $rules['config.origin_destination_id'] = ['sometimes', 'nullable', 'integer', 'min:1'];
            $rules['config.origin_address'] = ['sometimes', 'nullable', 'string', 'max:255'];
            $rules['config.origin_latitude'] = ['sometimes', 'nullable', 'numeric', 'between:-90,90'];
            $rules['config.origin_longitude'] = ['sometimes', 'nullable', 'numeric', 'between:-180,180'];
        }

        return $rules;
    }
}