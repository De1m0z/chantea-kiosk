<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateModifierGroupRequest extends FormRequest
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
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('modifier_groups', 'name')->ignore($this->route('modifier_group')),
            ],
            'min_select' => 'nullable|integer|min:0',
            'max_select' => 'nullable|integer|min:1',
            'required' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }
}
