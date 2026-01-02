<?php

namespace Database\Seeders;

use App\Models\Modifier;
use App\Models\ModifierGroup;
use Illuminate\Database\Seeder;

class ModifierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sugarGroup = ModifierGroup::where('name', 'Sugar Level')->first();
        $iceGroup = ModifierGroup::where('name', 'Ice Level')->first();
        $toppingsGroup = ModifierGroup::where('name', 'Toppings')->first();

        // Sugar Level modifiers
        $sugarLevels = [
            ['name' => '0% Sugar', 'price_adjustment' => 0, 'sort_order' => 1],
            ['name' => '25% Sugar', 'price_adjustment' => 0, 'sort_order' => 2],
            ['name' => '50% Sugar', 'price_adjustment' => 0, 'sort_order' => 3],
            ['name' => '75% Sugar', 'price_adjustment' => 0, 'sort_order' => 4],
            ['name' => '100% Sugar', 'price_adjustment' => 0, 'sort_order' => 5],
        ];

        foreach ($sugarLevels as $level) {
            Modifier::create([
                'modifier_group_id' => $sugarGroup->id,
                'name' => $level['name'],
                'price_adjustment' => $level['price_adjustment'],
                'is_active' => true,
                'sort_order' => $level['sort_order'],
            ]);
        }

        // Ice Level modifiers
        $iceLevels = [
            ['name' => 'No Ice', 'price_adjustment' => 0, 'sort_order' => 1],
            ['name' => 'Less Ice', 'price_adjustment' => 0, 'sort_order' => 2],
            ['name' => 'Regular Ice', 'price_adjustment' => 0, 'sort_order' => 3],
            ['name' => 'Extra Ice', 'price_adjustment' => 0, 'sort_order' => 4],
        ];

        foreach ($iceLevels as $level) {
            Modifier::create([
                'modifier_group_id' => $iceGroup->id,
                'name' => $level['name'],
                'price_adjustment' => $level['price_adjustment'],
                'is_active' => true,
                'sort_order' => $level['sort_order'],
            ]);
        }

        // Toppings modifiers
        $toppings = [
            ['name' => 'Boba Pearls', 'price_adjustment' => 0.50, 'sort_order' => 1],
            ['name' => 'Pudding', 'price_adjustment' => 0.50, 'sort_order' => 2],
            ['name' => 'Coconut Jelly', 'price_adjustment' => 0.50, 'sort_order' => 3],
            ['name' => 'Aloe Vera', 'price_adjustment' => 0.50, 'sort_order' => 4],
            ['name' => 'Cheese Foam', 'price_adjustment' => 1.00, 'sort_order' => 5],
        ];

        foreach ($toppings as $topping) {
            Modifier::create([
                'modifier_group_id' => $toppingsGroup->id,
                'name' => $topping['name'],
                'price_adjustment' => $topping['price_adjustment'],
                'is_active' => true,
                'sort_order' => $topping['sort_order'],
            ]);
        }

        // Dipping Sauce modifiers
        $dippingGroup = ModifierGroup::where('name', 'Dipping Sauce')->first();
        if ($dippingGroup) {
            $dippingSauces = [
                ['name' => 'Sweet Chili', 'price_adjustment' => 0, 'sort_order' => 1],
                ['name' => 'Ranch', 'price_adjustment' => 0.25, 'sort_order' => 2],
                ['name' => 'Garlic Mayo', 'price_adjustment' => 0.25, 'sort_order' => 3],
                ['name' => 'Soy Vinegar', 'price_adjustment' => 0, 'sort_order' => 4],
                ['name' => 'Sriracha', 'price_adjustment' => 0, 'sort_order' => 5],
            ];

            foreach ($dippingSauces as $sauce) {
                Modifier::create([
                    'modifier_group_id' => $dippingGroup->id,
                    'name' => $sauce['name'],
                    'price_adjustment' => $sauce['price_adjustment'],
                    'is_active' => true,
                    'sort_order' => $sauce['sort_order'],
                ]);
            }
        }

        // Spice Level modifiers
        $spiceGroup = ModifierGroup::where('name', 'Spice Level')->first();
        if ($spiceGroup) {
            $spiceLevels = [
                ['name' => 'Mild', 'price_adjustment' => 0, 'sort_order' => 1],
                ['name' => 'Medium', 'price_adjustment' => 0, 'sort_order' => 2],
                ['name' => 'Hot', 'price_adjustment' => 0, 'sort_order' => 3],
                ['name' => 'Extra Hot', 'price_adjustment' => 0, 'sort_order' => 4],
            ];

            foreach ($spiceLevels as $level) {
                Modifier::create([
                    'modifier_group_id' => $spiceGroup->id,
                    'name' => $level['name'],
                    'price_adjustment' => $level['price_adjustment'],
                    'is_active' => true,
                    'sort_order' => $level['sort_order'],
                ]);
            }
        }
    }
}
