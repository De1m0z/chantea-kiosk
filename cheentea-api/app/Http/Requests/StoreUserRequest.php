<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'role'     => 'required|in:admin,staff,customer',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

        public function messages(): array
    {
        return [
            'name.required'  => 'The user name is required.',
            'email.unique'   => 'This email is already taken.',
            'role.in'        => 'Role must be admin, staff, or customer.',
            'password.min'   => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Passwords do not match.',
        ];
    }   
}
