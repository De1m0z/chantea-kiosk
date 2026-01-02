<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Redirects the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json([
            'url' => $url
        ]);
    }

    /**
     * Handles the Google callback, ensuring a Customer record is linked to the User.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $token = '';
            $user = null;

            // 1. Find or create the User based on google_id
            $user = User::where('google_id', $googleUser->id)->first();

            if (!$user) {
                // --- NEW USER CREATION PATH (TEMPORARILY REMOVING DB::transaction) ---
                // We are removing the transaction here to see if the environment is causing
                // a silent rollback of the two saves (Customer::create and User::save)
                Log::info('Creating NEW user for Google ID: ' . $googleUser->id);

                // A. Create the Customer record first
                $customer = Customer::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                ]);
                Log::info('Customer created with ID: ' . $customer->id);


                // B. Define the User data array (EXCLUDE customer_id for initial create)
                $userData = [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,

                    'password' => Hash::make(base64_encode(random_bytes(16))),
                    'email_verified_at' => Carbon::now(),

                    'avatar' => $googleUser->avatar,
                    'google_id' => $googleUser->id,
                    'google_token' => $googleUser->token,
                    'role' => 'customer',
                ];

                // C. Create the User record using Eloquent Model
                $user = User::create($userData);

                // D. CRUCIAL FIX: Update the user immediately after creation to link the customer_id
                // This bypasses the $fillable check during the initial mass assignment.
                $user->customer_id = $customer->id;
                $user->save(); // Force persistence

                Log::info('User created and customer_id linked successfully (outside transaction)', [
                    'user_id' => $user->id,
                    'customer_id' => $user->customer_id
                ]);

            } else {
                // --- EXISTING USER UPDATE/LINK PROCESS (Kept inside transaction for atomicity) ---
                DB::transaction(function () use ($googleUser, &$user) {

                    $updateData = [
                        'name' => $googleUser->name,
                        'email' => $googleUser->email,
                        'avatar' => $googleUser->avatar,
                        'google_token' => $googleUser->token,
                    ];

                    if (is_null($user->customer_id)) {
                        Log::info('EXISTING User has no customer_id, attempting to link...');

                        $customer = Customer::where('email', $googleUser->email)->first();

                        if (!$customer) {
                            $customer = Customer::create([
                                'name' => $googleUser->name,
                                'email' => $googleUser->email,
                            ]);
                            Log::info('New customer created and linked (existing user path) with ID: ' . $customer->id);
                        } else {
                            Log::info('Found existing customer and linking with ID: ' . $customer->id);
                        }

                        $updateData['customer_id'] = $customer->id;
                    }

                    $user->update($updateData);

                    $user->refresh();

                    Log::info('User updated successfully (inside transaction)', [
                        'user_id' => $user->id,
                        'customer_id' => $user->customer_id
                    ]);
                });
            }

            // 2. Generate the authentication token
            $token = $user->createToken('google-auth-token')->plainTextToken;


            // Attempt to load the view for success
            $view = view('auth-callback', [
                'type' => 'GOOGLE_AUTH_SUCCESS',
                'user' => $user,
                'token' => $token
            ]);

            return response($view)
                ->header('Cross-Origin-Opener-Policy', 'unsafe-none');

        } catch (\Exception $e) {

            // Log the error and attempt to pass the message to the view
            Log::error('Google Auth Callback Error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            // Try to load the error view, passing the message
            $view = view('auth-callback', [
                'type' => 'GOOGLE_AUTH_ERROR',
                'error' => $e->getMessage()
            ]);

            return response($view)
                ->header('Cross-Origin-Opener-Policy', 'unsafe-none');
        }
    }

    /**
     * Logs the authenticated user out.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Returns the authenticated user's details.
     */
    public function user(Request $request)
    {
        // Eager load the customer record for the authenticated user
        return response()->json($request->user()->load('customer'));
    }
}
