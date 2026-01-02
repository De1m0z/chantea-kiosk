<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModifierRequest;
use App\Http\Requests\UpdateModifierRequest;
use App\Models\Modifier;
use Illuminate\Http\JsonResponse;

class ModifierController extends Controller
{
    /**
     * Display a listing of all modifiers.
     */
    public function index(): JsonResponse
    {
        $modifiers = Modifier::with('group')
            ->orderBy('modifier_group_id')
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse($modifiers, 'Modifiers retrieved successfully');
    }

    /**
     * Store a newly created modifier.
     */
    public function store(StoreModifierRequest $request): JsonResponse
    {
        $data = $request->validated();

        $modifier = Modifier::create([
            'modifier_group_id' => $data['modifier_group_id'],
            'name' => $data['name'],
            'price_adjustment' => $data['price_adjustment'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return $this->createdResponse(
            $modifier->load('group'),
            'Modifier created successfully'
        );
    }

    /**
     * Display the specified modifier.
     */
    public function show(Modifier $modifier): JsonResponse
    {
        return $this->successResponse(
            $modifier->load('group'),
            'Modifier retrieved successfully'
        );
    }

    /**
     * Update the specified modifier.
     */
    public function update(UpdateModifierRequest $request, Modifier $modifier): JsonResponse
    {
        $data = $request->validated();

        $modifier->update([
            'modifier_group_id' => $data['modifier_group_id'] ?? $modifier->modifier_group_id,
            'name' => $data['name'] ?? $modifier->name,
            'price_adjustment' => $data['price_adjustment'] ?? $modifier->price_adjustment,
            'is_active' => $data['is_active'] ?? $modifier->is_active,
            'sort_order' => $data['sort_order'] ?? $modifier->sort_order,
        ]);

        return $this->successResponse(
            $modifier->load('group'),
            'Modifier updated successfully'
        );
    }

    /**
     * Remove the specified modifier.
     */
    public function destroy(Modifier $modifier): JsonResponse
    {
        // Prevent deletion if modifier is used in orders
        if ($modifier->orderItemModifiers()->exists()) {
            return $this->errorResponse(
                'Cannot delete modifier that has been used in orders.',
                422
            );
        }

        $modifier->delete();

        return $this->successResponse(null, 'Modifier deleted successfully');
    }
}
