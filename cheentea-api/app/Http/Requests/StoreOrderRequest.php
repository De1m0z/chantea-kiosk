<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\ProductSize;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Allow public access for Kiosk mode
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // We only validate the fields coming FROM the request body.
        // customer_id and user_id are securely pulled from the authenticated user.
        return [
            // Accept both kebab-case and single-word versions
            'order_type' => ['nullable', 'string', 'in:dine-in,take-out,takeout,delivery'],

            // Optional username for loyalty tracking
            'username' => ['nullable', 'string', 'min:3', 'max:50'],

            // Optional: redeem free drink with this order
            'redeem_free_drink' => ['nullable', 'boolean'],

            // The items array is required and must contain at least one item
            'items' => ['required', 'array', 'min:1'],

            // Validation rules for each item inside the 'items' array
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],

            // The product_size_id needs to be required and also exist in the product_sizes table.
            'items.*.product_size_id' => ['required', 'integer', 'exists:product_sizes,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            
            // Optional modifiers
            'items.*.modifier_ids' => ['sometimes', 'array'],
            'items.*.modifier_ids.*' => ['integer', 'exists:modifiers,id'],

            // Free reward fields
            'items.*.is_free_reward' => ['sometimes', 'boolean'],
            'items.*.free_drink_base_price' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'order_type.in' => 'Order type must be dine-in, takeout, or delivery.',
            'items.required' => 'You must include at least one order item.',
            'items.*.product_id.required' => 'Each item must reference a product.',
            'items.*.product_id.exists' => 'One of the products does not exist.',
            'items.*.product_size_id.required' => 'Each item must include a size selection.',
            'items.*.product_size_id.exists' => 'The selected product size does not exist.',
            'items.*.quantity.min' => 'Each item must have at least quantity 1.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // If the client sends snake_case ('dine_in') but your DB/Controller uses kebab-case ('dine-in'),
        // we can normalize it here, if necessary.
        $orderType = $this->input('order_type');
        if ($orderType && $orderType === 'dine_in') {
             $this->merge([
                'order_type' => 'dine-in',
            ]);
        }
    }
}
