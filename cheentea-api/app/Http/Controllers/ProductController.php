<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of all products for kiosk menu.
     * Use ?all=true to include inactive products (for admin).
     */
    public function index(): JsonResponse
    {
        $query = Product::with(['category', 'modifierGroups.modifiers', 'sizes']);

        // If 'all' query param is not set or false, filter active only
        if (!request()->boolean('all')) {
            $query->where('is_active', true);
        }

        $products = $query->get();

        return $this->successResponse($products, 'Products retrieved successfully');
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $product = DB::transaction(function () use ($data) {
                // Create product
                $product = Product::create([
                    'category_id' => $data['category_id'],
                    'name'        => $data['name'],
                    'description' => $data['description'] ?? null,
                    'sku'         => $data['sku'],
                    'is_active'   => $data['is_active'] ?? true,
                ]);

                // Create product sizes if provided
                if (!empty($data['sizes'])) {
                    foreach ($data['sizes'] as $size) {
                        ProductSize::create([
                            'product_id' => $product->id,
                            'size'       => $size['size'],
                            'price'      => $size['price'],
                        ]);
                    }
                }

                return $product;
            });

            return $this->createdResponse(
                $product->load('sizes'),
                'Product created successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'modifierGroups.modifiers', 'sizes']);

        return $this->successResponse($product, 'Product retrieved successfully');
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        try {
            $product = DB::transaction(function () use ($product, $data) {
                // Update product
                $product->update([
                    'category_id' => $data['category_id'] ?? $product->category_id,
                    'name'        => $data['name'] ?? $product->name,
                    'description' => $data['description'] ?? $product->description,
                    'sku'         => $data['sku'] ?? $product->sku,
                    'is_active'   => $data['is_active'] ?? $product->is_active,
                ]);

                // If sizes provided, replace old sizes with new ones
                if (isset($data['sizes'])) {
                    $product->sizes()->delete();
                    foreach ($data['sizes'] as $size) {
                        ProductSize::create([
                            'product_id' => $product->id,
                            'size'       => $size['size'],
                            'price'      => $size['price'],
                        ]);
                    }
                }

                return $product;
            });

            return $this->successResponse(
                $product->load('sizes'),
                'Product updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        // Check if product is in any orders before deleting
        if ($product->orderItems()->exists()) {
            return $this->errorResponse(
                'Cannot delete product with existing orders. Deactivate it instead.',
                422
            );
        }

        try {
            DB::transaction(function () use ($product) {
                $product->sizes()->delete();
                $product->delete();
            });

            return $this->successResponse(null, 'Product deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Sync modifier groups for a product.
     */
    public function syncModifiers(Product $product): JsonResponse
    {
        $validated = request()->validate([
            'modifier_group_ids' => 'present|array',
            'modifier_group_ids.*' => 'integer|exists:modifier_groups,id',
        ]);

        try {
            $product->modifierGroups()->sync($validated['modifier_group_ids']);

            return $this->successResponse(
                $product->load('modifierGroups.modifiers'),
                'Product modifiers updated successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update product modifiers: ' . $e->getMessage(), 500);
        }
    }
}
