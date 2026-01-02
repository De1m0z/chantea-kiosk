<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get daily sales summary for the dashboard.
     */
    public function dailySales(): JsonResponse
    {
        $today = now()->toDateString();
        
        // Get all completed orders for today with their items and categories
        $orders = Order::with(['items.product.category'])
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->get();
        
        $drinksTotal = 0;
        $snacksTotal = 0;
        $drinksCount = 0;
        $snacksCount = 0;
        
        // Snacks category name (adjust if different in your database)
        $snacksCategoryName = 'Snacks';
        
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $categoryName = $item->product->category->name ?? '';
                $itemTotal = $item->line_total ?? ($item->unit_price * $item->quantity);
                
                // Check if category is a snack category
                if (in_array($categoryName, ['Snacks', 'Food'])) {
                    $snacksTotal += $itemTotal;
                    $snacksCount += $item->quantity;
                } else {
                    // All other categories are considered drinks
                    $drinksTotal += $itemTotal;
                    $drinksCount += $item->quantity;
                }
            }
        }
        
        $overallTotal = $drinksTotal + $snacksTotal;
        
        return $this->successResponse([
            'date' => $today,
            'drinks' => [
                'total' => round($drinksTotal, 2),
                'count' => $drinksCount,
            ],
            'snacks' => [
                'total' => round($snacksTotal, 2),
                'count' => $snacksCount,
            ],
            'overall' => [
                'total' => round($overallTotal, 2),
                'orders_count' => $orders->count(),
            ],
        ], 'Daily sales summary retrieved successfully');
    }

    /**
     * Get detailed daily sales breakdown for the dashboard modal.
     */
    public function dailySalesDetails(): JsonResponse
    {
        $today = now()->toDateString();
        
        // Get all completed orders for today with their items and categories
        $orders = Order::with(['items.product.category', 'items.productSize', 'customer'])
            ->where('status', 'completed')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->get();
        
        $drinksItems = [];
        $snacksItems = [];
        $snacksCategoryName = 'Snacks';
        
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $categoryName = $item->product->category->name ?? '';
                $itemData = [
                    'order_id' => $order->id,
                    'product_name' => $item->product->name ?? 'Unknown',
                    'size' => $item->productSize->size ?? 'Regular',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total ?? ($item->unit_price * $item->quantity),
                    'category' => $categoryName,
                    'ordered_at' => $order->created_at,
                ];
                
                if (in_array($categoryName, ['Snacks', 'Food'])) {
                    $snacksItems[] = $itemData;
                } else {
                    $drinksItems[] = $itemData;
                }
            }
        }
        
        return $this->successResponse([
            'date' => $today,
            'drinks' => $drinksItems,
            'snacks' => $snacksItems,
            'orders' => $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'total' => $order->total,
                    'order_type' => $order->order_type,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at,
                ];
            }),
        ], 'Daily sales details retrieved successfully');
    }
}
