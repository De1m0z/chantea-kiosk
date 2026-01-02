<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of all categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')->get();

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return $this->createdResponse($category, 'Category created successfully');
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        $category->load('products');

        return $this->successResponse($category, 'Category retrieved successfully');
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return $this->successResponse($category->fresh(), 'Category updated successfully');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check if category has products before deleting
        if ($category->products()->exists()) {
            return $this->errorResponse(
                'Cannot delete category with existing products. Remove products first.',
                422
            );
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
