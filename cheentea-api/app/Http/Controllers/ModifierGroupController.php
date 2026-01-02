<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModifierGroupRequest;
use App\Http\Requests\UpdateModifierGroupRequest;
use App\Models\ModifierGroup;
use Illuminate\Http\JsonResponse;

class ModifierGroupController extends Controller
{
    /**
     * Display a listing of all modifier groups.
     */
    public function index(): JsonResponse
    {
        $groups = ModifierGroup::with('modifiers')
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse($groups, 'Modifier groups retrieved successfully');
    }

    /**
     * Store a newly created modifier group.
     */
    public function store(StoreModifierGroupRequest $request): JsonResponse
    {
        $data = $request->validated();

        $group = ModifierGroup::create([
            'name' => $data['name'],
            'min_select' => $data['min_select'] ?? 0,
            'max_select' => $data['max_select'] ?? null,
            'required' => $data['required'] ?? false,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return $this->createdResponse(
            $group->load('modifiers'),
            'Modifier group created successfully'
        );
    }

    /**
     * Display the specified modifier group.
     */
    public function show(ModifierGroup $modifierGroup): JsonResponse
    {
        return $this->successResponse(
            $modifierGroup->load('modifiers'),
            'Modifier group retrieved successfully'
        );
    }

    /**
     * Update the specified modifier group.
     */
    public function update(UpdateModifierGroupRequest $request, ModifierGroup $modifierGroup): JsonResponse
    {
        $data = $request->validated();

        $modifierGroup->update([
            'name' => $data['name'] ?? $modifierGroup->name,
            'min_select' => $data['min_select'] ?? $modifierGroup->min_select,
            'max_select' => $data['max_select'] ?? $modifierGroup->max_select,
            'required' => $data['required'] ?? $modifierGroup->required,
            'sort_order' => $data['sort_order'] ?? $modifierGroup->sort_order,
        ]);

        return $this->successResponse(
            $modifierGroup->load('modifiers'),
            'Modifier group updated successfully'
        );
    }

    /**
     * Remove the specified modifier group.
     */
    public function destroy(ModifierGroup $modifierGroup): JsonResponse
    {
        // Prevent deletion if modifiers exist
        if ($modifierGroup->modifiers()->exists()) {
            return $this->errorResponse(
                'Cannot delete modifier group with existing modifiers. Delete modifiers first.',
                422
            );
        }

        $modifierGroup->delete();

        return $this->successResponse(null, 'Modifier group deleted successfully');
    }
}
