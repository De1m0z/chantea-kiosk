<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreModifierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // TODO: Add proper authorization
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'modifier_group_id' => 'required|integer|exists:modifier_groups,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('modifiers')->where(function ($query) {
                    return $query->where('modifier_group_id', $this->modifier_group_id);
                }),
            ],
            'price_adjustment' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'modifier_group_id.required' => 'Modifier group is required.',
            'modifier_group_id.exists' => 'The selected modifier group does not exist.',
            'name.required' => 'Modifier name is required.',
            'name.unique' => 'A modifier with this name already exists in this group.',
        ];
    }
}
