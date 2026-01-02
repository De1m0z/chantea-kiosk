<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\Registered;

class LoyaltyController extends Controller
{
    /**
     * Lookup customer by username.
     * GET /api/loyalty/lookup?username=xxx
     */
    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|min:3',
        ]);

        $customer = Customer::where('username', $request->username)->first();

        if (!$customer) {
            return $this->errorResponse('Account not found', 404);
        }

        if (!$customer->hasVerifiedEmail()) {
            return $this->errorResponse('Email not verified. Please check your inbox.', 403);
        }

        return $this->successResponse([
            'id' => $customer->id,
            'name' => $customer->name,
            'username' => $customer->username,
            'stamps' => $customer->stamps,
            'can_redeem' => $customer->canRedeemFreeDrink(),
            'stamps_until_free' => max(0, 10 - $customer->stamps),
        ], 'Customer found');
    }

    /**
     * Get loyalty status for a customer.
     * GET /api/loyalty/status/{customerId}
     */
    public function status(int $customerId): JsonResponse
    {
        $customer = Customer::find($customerId);

        if (!$customer) {
            return $this->errorResponse('Customer not found', 404);
        }

        return $this->successResponse([
            'stamps' => $customer->stamps,
            'can_redeem' => $customer->canRedeemFreeDrink(),
            'stamps_until_free' => max(0, 10 - $customer->stamps),
        ], 'Loyalty status retrieved');
    }

    /**
     * Register a new customer account.
     * POST /api/customers/register
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'username' => 'required|string|min:3|max:50|unique:customers,username|regex:/^[a-zA-Z0-9_]+$/',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
        ], [
            'username.regex' => 'Username can only contain letters, numbers, and underscores.',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422);
        }

        try {
            $customer = Customer::create([
                'name' => $request->name,
                'email' => $request->email,
                'username' => strtolower($request->username),
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'stamps' => 0,
            ]);

            Log::info('Customer registered', ['customer_id' => $customer->id, 'username' => $customer->username]);

            event(new Registered($customer));

            return $this->createdResponse([
                'id' => $customer->id,
                'name' => $customer->name,
                'username' => $customer->username,
                'stamps' => $customer->stamps,
                'message' => "Account created! Use \"{$customer->username}\" at the kiosk.",
            ], 'Account created successfully');
        } catch (\Exception $e) {
            Log::error('Customer registration failed', ['error' => $e->getMessage()]);
            return $this->errorResponse('Registration failed', 500);
        }
    }

    /**
     * Redeem stamps for a free drink.
     * POST /api/loyalty/redeem
     */
    public function redeem(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
        ]);

        $customer = Customer::find($request->customer_id);

        if (!$customer->hasVerifiedEmail()) {
            return $this->errorResponse('Email not verified.', 403);
        }

        if (!$customer->canRedeemFreeDrink()) {
            return $this->errorResponse('Not enough stamps. Need 10 stamps to redeem.', 400);
        }

        $customer->redeemFreeDrink();

        Log::info('Free drink redeemed', ['customer_id' => $customer->id, 'remaining_stamps' => $customer->stamps]);

        return $this->successResponse([
            'redeemed' => true,
            'remaining_stamps' => $customer->stamps,
            'message' => 'Free drink redeemed! Enjoy!',
        ], 'Free drink redeemed successfully');
    }

    /**
     * Calculate how many stamps an order would earn.
     * POST /api/loyalty/preview
     */
    public function previewStamps(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $stampCount = 0;
        $drinkCategories = [
            'Milk Tea', 
            'Fruit Tea', 
            'Specials', 
            'Best Seller Series', 
            'Milk Tea Series', 
            'Coffee Series', 
            'Smoothie Series', 
            'Latte Series', 
            'Fruit Soda Series'
        ];

        foreach ($request->items as $item) {
            $product = Product::with('category')->find($item['product_id']);
            
            if ($product && $product->category && in_array($product->category->name, $drinkCategories)) {
                $stampCount += $item['quantity'];
            }
        }

        return $this->successResponse([
            'stamps_to_earn' => $stampCount,
        ], 'Stamp preview calculated');
    }
}
