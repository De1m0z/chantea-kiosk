<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;

class KitchenController extends Controller
{
    /**
     * Get all pending orders for the kitchen display.
     */
    public function pendingOrders(): JsonResponse
    {
        $orders = Order::with(['customer', 'items.product', 'items.productSize', 'items.modifiers.modifier'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();

        return $this->successResponse($orders, 'Pending orders retrieved successfully');
    }

    /**
     * Get all orders being prepared for the kitchen display.
     */
    public function preparingOrders(): JsonResponse
    {
        $orders = Order::with(['customer', 'items.product', 'items.productSize', 'items.modifiers.modifier'])
            ->where('status', 'preparing')
            ->orderBy('created_at', 'asc')
            ->get();

        return $this->successResponse($orders, 'Orders being prepared retrieved successfully');
    }

    /**
     * Get all ready orders for pickup display.
     */
    public function readyOrders(): JsonResponse
    {
        $orders = Order::with(['customer', 'items.product', 'items.productSize'])
            ->where('status', 'ready')
            ->orderBy('created_at', 'asc')
            ->get();

        return $this->successResponse($orders, 'Ready orders retrieved successfully');
    }

    /**
     * Get all active orders (pending, preparing, ready) for the kitchen display.
     */
    public function activeOrders(): JsonResponse
    {
        $orders = Order::with(['customer', 'items.product', 'items.productSize', 'items.modifiers.modifier'])
            ->whereIn('status', ['pending', 'preparing', 'ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        $grouped = [
            'pending' => $orders->where('status', 'pending')->values(),
            'preparing' => $orders->where('status', 'preparing')->values(),
            'ready' => $orders->where('status', 'ready')->values(),
        ];

        return $this->successResponse($grouped, 'Active orders retrieved successfully');
    }
}
