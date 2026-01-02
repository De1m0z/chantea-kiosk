<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;
use App\Models\Product;
use App\Models\Category;
use Cloudinary\Cloudinary;

class ImageController extends Controller
{
    use ApiResponse;

    private function getCloudinary(): Cloudinary
    {
        return new Cloudinary(config('cloudinary.cloud_url'));
    }

    /**
     * Upload an image to Cloudinary for a product.
     */
    public function uploadProductImage(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
        ]);

        try {
            // Upload to Cloudinary using SDK directly
            $cloudinary = $this->getCloudinary();
            $uploadedFile = $cloudinary->uploadApi()->upload($request->file('image')->getRealPath(), [
                'folder' => 'cheentea/products',
                'public_id' => 'product_' . $product->id,
                'overwrite' => true,
            ]);

            // Save the secure URL to the product
            $product->image_url = $uploadedFile['secure_url'];
            $product->save();

            return $this->successResponse([
                'image_url' => $product->image_url,
                'product' => $product,
            ], 'Product image uploaded successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload image: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Upload an image to Cloudinary for a category.
     */
    public function uploadCategoryImage(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
        ]);

        try {
            // Upload to Cloudinary using SDK directly
            $cloudinary = $this->getCloudinary();
            $uploadedFile = $cloudinary->uploadApi()->upload($request->file('image')->getRealPath(), [
                'folder' => 'cheentea/categories',
                'public_id' => 'category_' . $category->id,
                'overwrite' => true,
            ]);

            // Save the secure URL to the category
            $category->image_url = $uploadedFile['secure_url'];
            $category->save();

            return $this->successResponse([
                'image_url' => $category->image_url,
                'category' => $category,
            ], 'Category image uploaded successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload image: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete product image from Cloudinary.
     */
    public function deleteProductImage(Product $product): JsonResponse
    {
        try {
            if ($product->image_url) {
                // Delete from Cloudinary using SDK directly
                $cloudinary = $this->getCloudinary();
                $cloudinary->uploadApi()->destroy('cheentea/products/product_' . $product->id);
                
                $product->image_url = null;
                $product->save();
            }

            return $this->successResponse(null, 'Product image deleted successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete image: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete category image from Cloudinary.
     */
    public function deleteCategoryImage(Category $category): JsonResponse
    {
        try {
            if ($category->image_url) {
                // Delete from Cloudinary using SDK directly
                $cloudinary = $this->getCloudinary();
                $cloudinary->uploadApi()->destroy('cheentea/categories/category_' . $category->id);

                $category->image_url = null;
                $category->save();
            }

            return $this->successResponse(null, 'Category image deleted successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete image: ' . $e->getMessage(), 500);
        }
    }
}
