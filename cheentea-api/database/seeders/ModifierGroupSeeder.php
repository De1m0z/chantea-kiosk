<?php

namespace Database\Seeders;

use App\Models\ModifierGroup;
use Illuminate\Database\Seeder;

class ModifierGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            // Drink modifiers
            [
                'name' => 'Sugar Level',
                'min_select' => 1,
                'max_select' => 1,
                'required' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Ice Level',
                'min_select' => 1,
                'max_select' => 1,
                'required' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Toppings',
                'min_select' => 0,
                'max_select' => 5,
                'required' => false,
                'sort_order' => 3,
            ],
            // Snack modifiers
            [
                'name' => 'Dipping Sauce',
                'min_select' => 0,
                'max_select' => 2,
                'required' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Spice Level',
                'min_select' => 0,
                'max_select' => 1,
                'required' => false,
                'sort_order' => 5,
            ],
            // Chicken Wings specific
            [
                'name' => 'Chicken Wings Flavor',
                'min_select' => 1,
                'max_select' => 1,
                'required' => true,
                'sort_order' => 6,
            ],
            // Rice add-on
            [
                'name' => 'Rice',
                'min_select' => 0,
                'max_select' => 1,
                'required' => false,
                'sort_order' => 7,
            ],
        ];

        foreach ($groups as $group) {
            ModifierGroup::create($group);
        }
    }
}
