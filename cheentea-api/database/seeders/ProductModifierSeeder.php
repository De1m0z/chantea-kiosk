<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ModifierGroup;
use Illuminate\Database\Seeder;

class ProductModifierSeeder extends Seeder
{
    /**
     * Seed product-modifier group associations.
     * 
     * Assigns drink-related modifiers (Sugar Level, Ice Level, Toppings) 
     * only to drink products. Assigns Dipping Sauce and Spice Level to food.
     */
    public function run(): void
    {
        // Get all modifier groups for drinks
        $sugarGroup = ModifierGroup::where('name', 'Sugar Level')->first();
        $iceGroup = ModifierGroup::where('name', 'Ice Level')->first();
        $toppingsGroup = ModifierGroup::where('name', 'Toppings')->first();

        // Get food modifier groups
        $dippingGroup = ModifierGroup::where('name', 'Dipping Sauce')->first();
        $spiceGroup = ModifierGroup::where('name', 'Spice Level')->first();

        // Categories that are drinks and should have drink modifiers
        $drinkCategories = [
            'Best Seller Series',
            'Milk Tea Series', 
            'Coffee Series',
            'Smoothie Series',
            'Fruit Tea Series',
            'Latte Series',
            'Fruit Soda Series'
        ];
        
        // Categories that are food and should have food modifiers
        $foodCategories = ['Food'];

        // Get all products and assign modifiers based on category
        $products = Product::with('category')->get();

        foreach ($products as $product) {
            $categoryName = $product->category->name ?? '';
            
            // Detach all existing modifiers first to avoid duplicates
            $product->modifierGroups()->detach();

            if (in_array($categoryName, $drinkCategories)) {
                // Attach drink modifiers to drink products
                $modifierGroupIds = [];
                
                if ($sugarGroup) {
                    $modifierGroupIds[] = $sugarGroup->id;
                }
                if ($iceGroup) {
                    $modifierGroupIds[] = $iceGroup->id;
                }
                if ($toppingsGroup) {
                    $modifierGroupIds[] = $toppingsGroup->id;
                }
                
                $product->modifierGroups()->attach($modifierGroupIds);
                
                $this->command->info("Assigned drink modifiers to: {$product->name} ({$categoryName})");
            } elseif (in_array($categoryName, $foodCategories)) {
                // Attach food modifiers to food products
                $modifierGroupIds = [];
                
                if ($dippingGroup) {
                    $modifierGroupIds[] = $dippingGroup->id;
                }
                if ($spiceGroup) {
                    $modifierGroupIds[] = $spiceGroup->id;
                }
                
                $product->modifierGroups()->attach($modifierGroupIds);
                
                $this->command->info("Assigned food modifiers to: {$product->name} ({$categoryName})");
            } else {
                // Other categories get no modifiers
                $this->command->info("No modifiers assigned to: {$product->name} ({$categoryName})");
            }
        }
    }
}
