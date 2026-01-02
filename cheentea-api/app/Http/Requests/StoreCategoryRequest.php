<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id',
            'sort_order'  => 'nullable|integer|min:0',
        ];
    }
    
        public function messages(): array
    {
        return [
            'name.required'     => 'Please provide a category name.',
            'name.string'       => 'Category name must be a string.',
            'name.max'          => 'Category name may not be longer than 255 characters.',
            'name.unique'       => 'This category name already exists.',

            'description.string' => 'The description must be text.',

            'parent_id.exists'  => 'The selected parent category does not exist.',

            'sort_order.integer' => 'Sort order must be a number.',
            'sort_order.min'     => 'Sort order must be 0 or greater.',
        ];
    }
}
