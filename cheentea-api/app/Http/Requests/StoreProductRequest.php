<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:150',
            'description'   => 'nullable|string',
            'sku'           => 'nullable|string|max:50|unique:products,sku',
            'is_active'     => 'boolean',

            // validate sizes
            'sizes'         => 'required|array|min:1',
            'sizes.*.size'  => 'required|string|max:50',
            'sizes.*.price' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'category_id.required' => 'A category is required for the product.',
            'category_id.exists'   => 'The selected category does not exist.',

            'name.required'        => 'Please provide a product name.',
            'name.max'             => 'Product name may not be longer than 150 characters.',

            'sku.max'              => 'SKU may not be longer than 50 characters.',
            'sku.unique'           => 'This SKU already exists.',

            'is_active.boolean'    => 'The active status must be true or false.',

            'sizes.required'       => 'Please provide at least one size.',
            'sizes.array'          => 'Sizes must be provided as an array.',
            'sizes.min'            => 'At least one size is required.',
            'sizes.*.size.required'=> 'Each size entry must have a name.',
            'sizes.*.price.required'=> 'Each size entry must have a price.',
            'sizes.*.price.numeric'=> 'The price must be a valid number.',
            'sizes.*.price.min'    => 'The price must be at least 0.',
        ];
    }
}
