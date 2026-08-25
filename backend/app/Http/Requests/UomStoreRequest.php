<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UomStoreRequest extends FormRequest
{
    public function rules(): array
    {
        $creating = $this->isMethod('post');

        return [
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:50'],
            'code' => [$creating ? 'required' : 'sometimes', 'string', 'max:20', Rule::unique('uoms', 'code')->ignore($this->route('uom'))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
