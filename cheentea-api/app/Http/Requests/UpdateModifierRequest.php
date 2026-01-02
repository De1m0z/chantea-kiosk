<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateModifierRequest extends FormRequest
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
        $modifierId = $this->route('modifier')?->id ?? $this->route('modifier');

        return [
            'modifier_group_id' => 'sometimes|integer|exists:modifier_groups,id',
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('modifiers')->where(function ($query) {
                    $groupId = $this->modifier_group_id ?? $this->route('modifier')?->modifier_group_id;
                    return $query->where('modifier_group_id', $groupId);
                })->ignore($modifierId),
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
            'modifier_group_id.exists' => 'The selected modifier group does not exist.',
            'name.unique' => 'A modifier with this name already exists in this group.',
        ];
    }
}
