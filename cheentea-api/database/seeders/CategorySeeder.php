<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Best Seller Series', 'description' => 'Our most popular drinks', 'sort_order' => 1],
            ['name' => 'Milk Tea Series', 'description' => 'Classic milk tea beverages', 'sort_order' => 2],
            ['name' => 'Coffee Series', 'description' => 'Coffee-based drinks', 'sort_order' => 3],
            ['name' => 'Smoothie Series', 'description' => 'Blended smoothie drinks', 'sort_order' => 4],
            ['name' => 'Fruit Tea Series', 'description' => 'Refreshing fruit teas', 'sort_order' => 5],
            ['name' => 'Latte Series', 'description' => 'Creamy latte drinks', 'sort_order' => 6],
            ['name' => 'Fruit Soda Series', 'description' => 'Fizzy fruit sodas', 'sort_order' => 7],
            ['name' => 'Food', 'description' => 'Snacks and food items', 'sort_order' => 8],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
