<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of all users (staff/admin).
     */
    public function index(): JsonResponse
    {
        $users = User::select(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
            ->withCount('orders')
            ->get();

        return $this->successResponse($users, 'Users retrieved successfully');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'role'     => $data['role'],
                'password' => Hash::make($data['password']),
            ]);

            Log::info('User created', ['user_id' => $user->id, 'email' => $user->email]);

            return $this->createdResponse(
                $user->only(['id', 'name', 'email', 'role', 'created_at']),
                'User created successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to create user', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to create user', 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        return $this->successResponse(
            $user->only(['id', 'name', 'email', 'role', 'created_at', 'updated_at']),
            'User retrieved successfully'
        );
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        try {
            $data = $request->validated();

            // Hash password only if provided
            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            $user->update($data);

            Log::info('User updated', ['user_id' => $user->id]);

            return $this->successResponse(
                $user->fresh()->only(['id', 'name', 'email', 'role', 'updated_at']),
                'User updated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to update user', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to update user', 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent self-deletion
        if (auth()->id() === $user->id) {
            return $this->errorResponse('Cannot delete your own account', 422);
        }

        // Check if user has orders before deleting
        if ($user->orders()->exists()) {
            return $this->errorResponse(
                'Cannot delete user with existing orders. Deactivate instead.',
                422
            );
        }

        try {
            Log::info('User deleted', ['user_id' => $user->id, 'email' => $user->email]);
            $user->delete();

            return $this->successResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete user', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to delete user', 500);
        }
    }
}
