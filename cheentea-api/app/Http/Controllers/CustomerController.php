<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Customer login for kiosk ordering.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:1',
        ]);

        $email = $request->email;
        $password = $request->password;

        // Find user by email
        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::warning('Login attempt with non-existent email', ['email' => $email]);
            return $this->unauthorizedResponse('Invalid email or password.');
        }

        // Verify password
        if (!Hash::check($password, $user->password)) {
            Log::warning('Login attempt with invalid password', ['email' => $email]);
            return $this->unauthorizedResponse('Invalid email or password.');
        }

        // Check if user has customer role and linked customer record
        $customer = $user->customer;

        if (!$customer) {
            return $this->forbiddenResponse('User is not associated with a customer account.');
        }

        if ($user->role !== 'customer') {
            return $this->forbiddenResponse('Account role is not authorized for kiosk login.');
        }

        // Generate Sanctum token
        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        Log::info('Customer login successful', ['user_id' => $user->id, 'customer_id' => $customer->id]);

        return $this->successResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'customer' => $customer,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ], 'Login successful');
    }

    /**
     * Display a listing of all customers.
     */
    public function index(): JsonResponse
    {
        $customers = Customer::with('orders')->get();

        return $this->successResponse($customers, 'Customers retrieved successfully');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        try {
            $customer = Customer::create($request->validated());

            return $this->createdResponse($customer, 'Customer created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create customer', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to create customer', 500);
        }
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['orders']);

        return $this->successResponse($customer, 'Customer retrieved successfully');
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        try {
            $customer->update($request->validated());

            return $this->successResponse($customer->fresh(), 'Customer updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update customer', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to update customer', 500);
        }
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer): JsonResponse
    {
        // Check if customer has orders before deleting
        if ($customer->orders()->exists()) {
            return $this->errorResponse(
                'Cannot delete customer with existing orders.',
                422
            );
        }

        try {
            $customer->delete();
            return $this->successResponse(null, 'Customer deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete customer', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to delete customer', 500);
        }
    }
}
