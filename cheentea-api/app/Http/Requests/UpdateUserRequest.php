<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
        $id = $this->route('user');
        return [
            'name'     => 'sometimes|string|max:150',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'role'     => 'sometimes|in:admin,staff,customer',
            'password' => 'nullable|string|min:8|confirmed',
        ];
    }

        public function messages(): array
    {
        return [
            'name.string'   => 'The name must be a string.',
            'name.max'      => 'The name may not be greater than 150 characters.',
            'email.email'   => 'Please provide a valid email address.',
            'email.unique'  => 'This email is already in use.',
            'role.in'       => 'Role must be admin, staff, or customer.',
            'password.min'  => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
