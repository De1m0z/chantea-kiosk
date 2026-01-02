<?php

namespace App\Http\Controllers;

use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Eager load relationships for order responses.
     */
    private array $orderRelations = ['customer', 'items.product.category', 'items.productSize', 'items.modifiers.modifier', 'cashier'];

    /**
     * Display a listing of all orders.
     */
    public function index(): JsonResponse
    {
        $orders = Order::with($this->orderRelations)
            ->orderBy('created_at', 'desc')
            ->take(100) // Limit to latest 100 orders for performance
            ->get();

        return $this->successResponse($orders, 'Orders retrieved successfully');
    }

    /**
     * Store a newly created order (Kiosk order creation).
     */
    /**
     * Store a newly created order (Kiosk order creation).
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $loyaltyCustomer = null;
        $stampsEarned = 0;
        $freeRedeemed = false;
        
        // Check for username-based loyalty tracking
        $username = $request->input('username');
        if ($username) {
            $loyaltyCustomer = \App\Models\Customer::where('username', strtolower($username))->first();
        }
        
        if ($user) {
            $customerId = $user->customer_id;
            $userId = $user->id;
            
            if (is_null($customerId)) {
                return $this->forbiddenResponse('Customer ID not found for this user.');
            }
        } else {
            // Guest/Kiosk Order - use loyalty customer if found, otherwise walk-in
            $userId = null;
            
            if ($loyaltyCustomer) {
                $customerId = $loyaltyCustomer->id;
            } else {
                // Use default Walk-in Customer or create one
                $customer = \App\Models\Customer::firstOrCreate(
                    ['email' => 'walkin@cheentea.com'], 
                    [
                        'name' => 'Walk-in Customer',
                        'phone' => null
                    ]
                );
                $customerId = $customer->id;
            }
        }

        $orderData = $request->validated();
        $itemsData = $orderData['items'];

        // Validate items exist
        if (empty($itemsData)) {
            return $this->errorResponse('Order must have at least one item', 422);
        }

        try {
            $order = DB::transaction(function () use ($orderData, $itemsData, $customerId, $userId, $loyaltyCustomer, &$stampsEarned, &$freeRedeemed) {
                
                // Calculate stamps to earn (only for drinks)
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
                foreach ($itemsData as $itemData) {
                    $product = \App\Models\Product::with('category')->find($itemData['product_id']);
                    if ($product && $product->category && in_array($product->category->name, $drinkCategories)) {
                        $stampsEarned += $itemData['quantity'];
                    }
                }

                // Handle free drink redemption - find the free drink item and calculate discount
                $discount = 0.00;
                if ($loyaltyCustomer && ($orderData['redeem_free_drink'] ?? false)) {
                    if ($loyaltyCustomer->canRedeemFreeDrink()) {
                        // Find the free drink item and use its base price as discount
                        foreach ($itemsData as $itemData) {
                            if (!empty($itemData['is_free_reward']) && !empty($itemData['free_drink_base_price'])) {
                                $discount = floatval($itemData['free_drink_base_price']);
                                break;
                            }
                        }
                        // Fallback to fixed discount if no free drink item found (legacy support)
                        if ($discount == 0.00) {
                            $discount = 80.00;
                        }
                        $loyaltyCustomer->redeemFreeDrink();
                        $freeRedeemed = true;
                        Log::info('Free drink redeemed', ['customer_id' => $loyaltyCustomer->id, 'discount' => $discount]);
                    }
                }

                // Create the main Order record with pending stamps (NOT awarded yet)
                $order = Order::create([
                    'customer_id' => $customerId,
                    'user_id'     => $userId,
                    'order_type'  => $orderData['order_type'] ?? 'dine-in',
                    'subtotal'    => 0.00,
                    'tax'         => 0.00,
                    'discount'    => $discount,
                    'total'       => 0.00,
                    'status'      => 'pending',
                    // Store pending stamps info - will be awarded when order is completed
                    'pending_stamps' => $stampsEarned,
                    'loyalty_customer_id' => $loyaltyCustomer?->id,
                    'stamps_awarded' => false,
                ]);

                // Process and create Order Items
                foreach ($itemsData as $itemData) {
                    $productSize = ProductSize::findOrFail($itemData['product_size_id']);
                    $basePrice = $productSize->price;
                    
                    // Calculate modifiers total for this item
                    $modifiersTotal = 0;
                    $modifierIds = $itemData['modifier_ids'] ?? [];
                    
                    // Create Order Item first
                    $orderItem = OrderItem::create([
                        'order_id'        => $order->id,
                        'product_id'      => $itemData['product_id'],
                        'product_size_id' => $itemData['product_size_id'],
                        'quantity'        => $itemData['quantity'],
                        'unit_price'      => $basePrice,
                        'line_total'      => 0, // Will update after modifiers
                        'is_free_reward'  => !empty($itemData['is_free_reward']),
                    ]);

                    // Attach modifiers if any
                    if (!empty($modifierIds)) {
                        foreach ($modifierIds as $modifierId) {
                            $modifier = \App\Models\Modifier::find($modifierId);
                            if ($modifier) {
                                \App\Models\OrderItemModifier::create([
                                    'order_item_id' => $orderItem->id,
                                    'modifier_id' => $modifier->id,
                                    'price_adjustment' => $modifier->price_adjustment,
                                ]);
                                $modifiersTotal += $modifier->price_adjustment;
                            }
                        }
                    }

                    // Update Item Line Total: (Base Price + Modifiers) * Quantity
                    $lineTotal = ($basePrice + $modifiersTotal) * $itemData['quantity'];
                    $orderItem->update(['line_total' => $lineTotal]);
                }

                // NOTE: Stamps are NOT awarded here anymore!
                // They will be awarded when the order status changes to 'completed'
                if ($loyaltyCustomer && $stampsEarned > 0) {
                    Log::info('Stamps pending for order', [
                        'order_id' => $order->id,
                        'customer_id' => $loyaltyCustomer->id,
                        'pending_stamps' => $stampsEarned,
                    ]);
                }

                return $this->recalculateOrderTotals($order);
            });

            Log::info('Order created', ['order_id' => $order->id, 'customer_id' => $customerId]);

            // Broadcast order created event for real-time displays
            try {
                broadcast(new OrderCreated($order))->toOthers();
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast order created event', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            }

            // Build response with loyalty info (stamps are PENDING, not earned yet)
            $responseData = $order->load($this->orderRelations)->toArray();
            if ($loyaltyCustomer) {
                $responseData['loyalty'] = [
                    'customer_name' => $loyaltyCustomer->name,
                    'stamps_pending' => $stampsEarned, // Renamed from stamps_earned
                    'stamps_earned' => 0, // No stamps earned yet - will be awarded on completion
                    'current_stamps' => $loyaltyCustomer->fresh()->stamps,
                    'free_drink_redeemed' => $freeRedeemed,
                    'can_redeem' => $loyaltyCustomer->fresh()->canRedeemFreeDrink(),
                    'message' => $stampsEarned > 0 ? "You'll earn {$stampsEarned} stamp(s) when your order is ready!" : null,
                ];
            }

            return $this->createdResponse(
                $responseData,
                'Order created successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to create order', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to create order: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        return $this->successResponse(
            $order->load($this->orderRelations),
            'Order retrieved successfully'
        );
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        // Only allow updates on pending orders
        if ($order->status !== 'pending') {
            return $this->errorResponse('Can only update pending orders', 422);
        }

        $data = $request->validated();

        try {
            $order = DB::transaction(function () use ($order, $data) {
                $order->fill($data)->save();
                return $this->recalculateOrderTotals($order);
            });

            return $this->successResponse(
                $order->load($this->orderRelations),
                'Order updated successfully'
            );
        } catch (\Exception $e) {
            Log::error('Failed to update order', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to update order', 500);
        }
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,preparing,ready,completed,cancelled',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;
        $order->status = $newStatus;
        $order->save();

        // Sync items status if order is marked ready, completed or cancelled
        // This ensures the Kitchen Display Board (which tracks items) updates correctly
        if ($newStatus === 'ready' || $newStatus === 'completed') {
            $order->items()->update(['status' => 'ready']);
        } elseif ($newStatus === 'cancelled') {
             // If cancelled, usually we don't track item status, but let's be safe 
             // (assuming item status column supports it or we leave it)
             // Actually, kitchen board filters out cancelled orders entirely, so this is just for data consistency
        }

        // Award stamps when order is completed (if not already awarded)
        $stampsAwarded = 0;
        if ($newStatus === 'completed' && !$order->stamps_awarded && $order->pending_stamps > 0 && $order->loyalty_customer_id) {
            $loyaltyCustomer = \App\Models\Customer::find($order->loyalty_customer_id);
            if ($loyaltyCustomer) {
                $loyaltyCustomer->awardStamps($order->pending_stamps);
                $stampsAwarded = $order->pending_stamps;
                
                // Mark stamps as awarded
                $order->stamps_awarded = true;
                $order->save();
                
                Log::info('Stamps awarded on order completion', [
                    'order_id' => $order->id,
                    'customer_id' => $loyaltyCustomer->id,
                    'stamps_awarded' => $stampsAwarded,
                    'total_stamps' => $loyaltyCustomer->fresh()->stamps,
                ]);
            }
        }

        Log::info('Order status updated', [
            'order_id' => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'stamps_awarded' => $stampsAwarded,
        ]);

        // Broadcast status update for real-time displays (Kitchen, Cashier, Kiosk tracking)
        try {
            broadcast(new OrderStatusUpdated($order, $oldStatus, $newStatus))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast order status update', ['order_id' => $order->id, 'error' => $e->getMessage()]);
        }

        return $this->successResponse(
            $order->load($this->orderRelations),
            'Order status updated successfully'
        );
    }

    /**
     * Update individual order item status.
     * Used by kitchen stations to independently track item preparation.
     */
    public function updateItemStatus(Request $request, Order $order, OrderItem $item): JsonResponse
    {
        // Verify the item belongs to this order
        if ($item->order_id !== $order->id) {
            return $this->errorResponse('Item does not belong to this order', 404);
        }

        $request->validate([
            'status' => 'required|string|in:pending,preparing,ready',
        ]);

        $oldStatus = $item->status ?? 'pending';
        $newStatus = $request->status;
        $item->status = $newStatus;
        $item->save();

        Log::info('Order item status updated', [
            'order_id' => $order->id,
            'item_id' => $item->id,
            'product_name' => $item->product?->name,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        // Check if ALL items in the order are now 'ready'
        $allItemsReady = $order->items()->where('status', '!=', 'ready')->count() === 0;
        
        // Auto-update order status based on item statuses
        $orderOldStatus = $order->status;
        if ($allItemsReady && $order->status !== 'ready' && $order->status !== 'completed') {
            $order->status = 'ready';
            $order->save();
            Log::info('Order auto-updated to ready (all items ready)', ['order_id' => $order->id]);
            try {
                broadcast(new OrderStatusUpdated($order, $orderOldStatus, 'ready'))->toOthers();
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast order ready event', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            }
        } elseif (!$allItemsReady && $order->status === 'pending') {
            // If any item is being prepared, update order to preparing
            $anyPreparing = $order->items()->where('status', 'preparing')->exists();
            if ($anyPreparing) {
                $order->status = 'preparing';
                $order->save();
                try {
                    broadcast(new OrderStatusUpdated($order, $orderOldStatus, 'preparing'))->toOthers();
                } catch (\Exception $e) {
                    Log::warning('Failed to broadcast order preparing event', ['order_id' => $order->id, 'error' => $e->getMessage()]);
                }
            }
        }

        // Broadcast the updated order for real-time displays
        try {
            broadcast(new OrderStatusUpdated($order->fresh(), $orderOldStatus, $order->status))->toOthers();
        } catch (\Exception $e) {
            Log::warning('Failed to broadcast order update event', ['order_id' => $order->id, 'error' => $e->getMessage()]);
        }

        return $this->successResponse(
            $order->load($this->orderRelations),
            'Item status updated successfully'
        );
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order): JsonResponse
    {
        // Only allow deletion of pending or cancelled orders
        if (!in_array($order->status, ['pending', 'cancelled'])) {
            return $this->errorResponse('Can only delete pending or cancelled orders', 422);
        }

        try {
            DB::transaction(function () use ($order) {
                $order->items()->delete();
                $order->delete();
            });

            Log::info('Order deleted', ['order_id' => $order->id]);

            return $this->successResponse(null, 'Order deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete order', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to delete order', 500);
        }
    }

    /**
     * Helper function to recalculate order totals.
     */
    protected function recalculateOrderTotals(Order $order): Order
    {
        $subtotal = $order->items()->sum('line_total');
        $tax = 0; // Tax calculation can be added here
        $discount = $order->discount ?? 0;
        $total = $subtotal + $tax - $discount;

        $order->update([
            'subtotal' => $subtotal,
            'tax'      => $tax,
            'total'    => max(0, $total), // Ensure total is never negative
        ]);

        return $order->fresh();
    }
}
