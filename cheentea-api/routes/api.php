<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\ModifierGroupController;
use App\Http\Controllers\ModifierController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KitchenController;
use App\Http\Controllers\Api\AuthController;
use App\Models\ModifierGroup;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'User retrieved successfully',
        'data' => $request->user(),
    ]);
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {

    // =============================================
    // KIOSK PUBLIC ENDPOINTS (No Auth Required)
    // =============================================

    // Place Order (Kiosk Mode)
    Route::post('orders', [OrderController::class, 'store']);

    // Menu - Categories
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

    // Menu - Products
    Route::apiResource('products', ProductController::class)->only(['index', 'show']);

    // Modifier groups for product customization (full CRUD for admin)
    Route::apiResource('modifier-groups', ModifierGroupController::class);

    // Individual modifiers (full CRUD for admin)
    Route::apiResource('modifiers', ModifierController::class);

    // Customers (public read for admin dashboard)
    Route::get('customers', [CustomerController::class, 'index']);
    Route::get('customers/{customer}', [CustomerController::class, 'show']);

    // =============================================
    // ADMIN/STAFF ENDPOINTS (Full CRUD)
    // =============================================

    Route::apiResource('customers', CustomerController::class)->except(['index', 'show']);
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::put('products/{product}/modifiers', [ProductController::class, 'syncModifiers']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('users', UserController::class);

    // Image uploads
    Route::post('products/{product}/image', [ImageController::class, 'uploadProductImage']);
    Route::delete('products/{product}/image', [ImageController::class, 'deleteProductImage']);
    Route::post('categories/{category}/image', [ImageController::class, 'uploadCategoryImage']);
    Route::delete('categories/{category}/image', [ImageController::class, 'deleteCategoryImage']);

    // Orders management
    Route::apiResource('orders', OrderController::class)->except(['store']);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Order items management
    Route::prefix('orders/{order}/items')->group(function () {
        Route::post('/', [OrderItemController::class, 'storeAdd']);
        Route::put('{item}', [OrderItemController::class, 'update']);
        Route::delete('{item}', [OrderItemController::class, 'destroy']);
        Route::patch('{item}/status', [OrderController::class, 'updateItemStatus']);
    });

    // =============================================
    // KITCHEN DISPLAY / ORDER QUEUE
    // =============================================

    Route::get('orders/queue/pending', [KitchenController::class, 'pendingOrders']);
    Route::get('orders/queue/preparing', [KitchenController::class, 'preparingOrders']);
    Route::get('orders/queue/ready', [KitchenController::class, 'readyOrders']);
    Route::get('orders/queue/active', [KitchenController::class, 'activeOrders']);

    // =============================================
    // DASHBOARD
    // =============================================

    Route::get('dashboard/daily-sales', [DashboardController::class, 'dailySales']);
    Route::get('dashboard/daily-sales/details', [DashboardController::class, 'dailySalesDetails']);
});

// =============================================
// AUTHENTICATION
// =============================================

Route::prefix('auth')->group(function () {
    Route::get('google', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// =============================================
// CUSTOMER KIOSK ENDPOINTS
// =============================================

Route::post('/v1/customer/login', [CustomerController::class, 'login'])->name('api.customer.login');

Route::middleware('auth:sanctum', 'role:customer')->group(function () {
    // Other customer routes can go here
});

// =============================================
// LOYALTY / REWARDS SYSTEM
// =============================================

use App\Http\Controllers\LoyaltyController;

Route::prefix('v1/loyalty')->group(function () {
    // Lookup customer by username (public - for kiosk)
    Route::get('lookup', [LoyaltyController::class, 'lookup']);
    
    // Preview stamps for an order (public - for kiosk)
    Route::post('preview', [LoyaltyController::class, 'previewStamps']);
    
    // Get stamp status for a customer
    Route::get('status/{customerId}', [LoyaltyController::class, 'status']);
    
    // Redeem free drink
    Route::post('redeem', [LoyaltyController::class, 'redeem']);
});

// Customer registration (public)
Route::post('v1/customers/register', [LoyaltyController::class, 'register']);

// =============================================
// EMAIL VERIFICATION
// =============================================

use Illuminate\Auth\Events\Verified;

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $customer = \App\Models\Customer::find($id);
    $frontendUrl = config('app.frontend_url', 'http://localhost:3002');

    if (!$customer) {
        return redirect($frontendUrl . '/?error=invalid_user');
    }

    if (! hash_equals((string) $hash, sha1($customer->getEmailForVerification()))) {
        return redirect($frontendUrl . '/?error=invalid_link');
    }

    $alreadyVerified = $customer->hasVerifiedEmail();

    if (!$alreadyVerified) {
        $customer->markEmailAsVerified();
        event(new Verified($customer));
    }

    return view('emails.verification-success', [
        'username' => $customer->username,
        'alreadyVerified' => $alreadyVerified,
    ]);
})->middleware(['signed'])->name('verification.verify');

Route::post('/email/resend-verification', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    
    $customer = \App\Models\Customer::where('email', $request->email)->first();
    
    if (!$customer) {
        return response()->json(['message' => 'If this email exists, a verification link has been sent.'], 200);
    }
    
    if ($customer->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email is already verified.'], 200);
    }
    
    $customer->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link sent!'], 200);
})->middleware(['throttle:3,1'])->name('verification.resend');










Route::get('v1/test-delete-user', function (Request $request) {
    if ($request->query('secret') !== 'dev-cleanup') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    $email = $request->query('email');
    $deleted = \App\Models\Customer::where('email', $email)->delete();
    return response()->json(['message' => "Deleted $deleted users with email $email"]);
});

// =============================================
// SYSTEM TEST ENDPOINTS
// =============================================

use Illuminate\Support\Facades\Mail;

Route::get('v1/test-email', function (Request $request) {
    try {
        $to = $request->query('email', 'russelbui224@gmail.com'); // Default to a safe test email or parameter
        
        Mail::raw('This is a test email from CheenTea Kiosk via Brevo SMTP. If you received this, your email configuration is working correctly.', function ($message) use ($to) {
            $message->to($to)
                    ->subject('CheenTea SMTP Connection Test');
        });
        
        return response()->json([
            'success' => true,
            'message' => "Test email sent successfully to {$to}",
            'config' => [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'username' => config('mail.mailers.smtp.username'),
                'from_address' => config('mail.from.address'),
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to send email',
            'error' => $e->getMessage(),
            'config' => [
                'mailer' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
            ]
        ], 500);
    }
});
