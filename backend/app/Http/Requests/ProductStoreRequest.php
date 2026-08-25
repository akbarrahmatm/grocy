<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductStoreRequest extends FormRequest
{
    public function rules(): array
    {
        $creating = $this->isMethod('post');

        return [
            'category_id' => [$creating ? 'required' : 'sometimes', 'integer', 'exists:categories,id'],
            'uom_id' => [$creating ? 'required' : 'sometimes', 'integer', 'exists:uoms,id'],
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:150'],
            'slug' => ['sometimes', 'string', 'max:180', Rule::unique('products', 'slug')->ignore($this->route('product'))],
            'sku' => ['sometimes', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($this->route('product'))],
            'description' => ['sometimes', 'nullable', 'string'],
            'thumbnail' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'price' => [$creating ? 'required' : 'sometimes', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
