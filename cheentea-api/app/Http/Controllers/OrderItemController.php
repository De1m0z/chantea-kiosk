<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderItemController extends Controller
{
    // Add items to an order
    public function storeAdd(Request $request, Order $order)
    {
        $request->validate([
            'items'   => 'required|array|min:1',
            'items.*.product_id'      => 'required|exists:products,id',
            'items.*.product_size_id' => 'required|exists:product_sizes,id',
            'items.*.quantity'        => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $order) {
            $subtotal = $order->items()->sum('line_total');

            foreach ($request->items as $item) {
                $productSize = ProductSize::where('product_id', $item['product_id'])
                                    ->findOrFail($item['product_size_id']);

                // Check if item with same product & size already exists
                $existingItem = $order->items()
                    ->where('product_id', $item['product_id'])
                    ->where('product_size_id', $productSize->id)
                    ->first();

                $lineTotal = $productSize->price * $item['quantity'];

                if ($existingItem) {
                    // Add quantity
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->line_total = $existingItem->quantity * $productSize->price;
                    $existingItem->unit_price = $productSize->price;
                    $existingItem->save();
                } else {
                    // Create new order item
                    OrderItem::create([
                        'order_id'        => $order->id,
                        'product_id'      => $item['product_id'],
                        'product_size_id' => $productSize->id,
                        'quantity'        => $item['quantity'],
                        'unit_price'      => $productSize->price,
                        'line_total'      => $lineTotal,
                    ]);
                }

                $subtotal += $lineTotal;
            }

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'tax'      => 0,
                'total'    => $subtotal,
            ]);

            return $order->load(['items.product', 'items.productSize']);
        });
    }

    // Update item quantity in an order
    public function update(Request $request, Order $order, OrderItem $item)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $order, $item) {
            $item->update([
                'quantity'   => $request->quantity,
                'line_total' => $item->unit_price * $request->quantity,
            ]);

            $this->recalculateTotals($order);

            return $order->load(['items.product', 'items.productSize']);
        });
    }

    // Delete an item from an order
    public function destroy(Order $order, OrderItem $item)
    {
        return DB::transaction(function () use ($order, $item) {
            $item->delete();

            $this->recalculateTotals($order);

            return $order->load(['items.product', 'items.productSize']);
        });
    }

    // Helper: recalc totals
    protected function recalculateTotals(Order $order)
    {
        $subtotal = $order->items()->sum('line_total');
        $tax = 0; // Add tax logic if needed
        $order->update([
            'subtotal' => $subtotal,
            'tax'      => $tax,
            'total'    => $subtotal + $tax,
        ]);
    }
}
