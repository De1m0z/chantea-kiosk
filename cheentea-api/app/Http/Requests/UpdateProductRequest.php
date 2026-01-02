<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product')?->id; // get current product id from route

        return [
            'category_id' => 'sometimes|exists:categories,id',
            'name'        => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'sku'         => 'nullable|string|max:50|unique:products,sku,' . $productId,
            'is_active'   => 'boolean',

            // Optional: update sizes if included
            'sizes'           => 'sometimes|array|min:1',
            'sizes.*.id'      => 'sometimes|exists:product_sizes,id',
            'sizes.*.size'    => 'required_with:sizes|string|max:50',
            'sizes.*.price'   => 'required_with:sizes|numeric|min:0',
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'category_id.exists'  => 'The selected category is invalid.',
            'name.max'            => 'The name must not exceed 150 characters.',
            'sku.unique'          => 'This SKU is already in use.',
            'sizes.array'         => 'Sizes must be an array.',
            'sizes.*.size.required_with'  => 'Each size entry must have a name.',
            'sizes.*.price.required_with' => 'Each size entry must have a price.',
            'sizes.*.price.min'           => 'Price must be at least 0.',
        ];
    }
}
