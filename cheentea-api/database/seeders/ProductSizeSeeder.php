<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSizeSeeder extends Seeder
{
    /**
     * Run the database seeds with exact prices from menu_data.md
     */
    public function run(): void
    {
        $products = Product::with('category')->get();

        // Price mapping based on menu_data.md (in PHP ₱)
        $priceMap = [
            // Best Seller Series - Medium/Large
            'Red Velvet' => ['Large' => 100], // Only Large available
            'Choco Cheese Cake' => ['Medium' => 85, 'Large' => 100],
            'Wintermelon' => ['Medium' => 85, 'Large' => 100],
            'Cookies and Cream' => ['Medium' => 85, 'Large' => 95],
            'Choco Nutella' => ['Medium' => 85, 'Large' => 100],
            'Strawberry Nutella' => ['Medium' => 85, 'Large' => 100],

            // Milk Tea Series - Medium/Large
            'Classic' => ['Medium' => 70, 'Large' => 85],
            'White Rabbit' => ['Medium' => 80, 'Large' => 90],
            'Thai Rose' => ['Medium' => 80, 'Large' => 90],
            'Matcha' => ['Medium' => 80, 'Large' => 90],
            'Okinawa' => ['Medium' => 80, 'Large' => 90],
            'RockSalt & Cheese' => ['Medium' => 80, 'Large' => 90],
            'Hokaido' => ['Medium' => 80, 'Large' => 90],
            'Milky Banana' => ['Medium' => 80, 'Large' => 90],
            'Chocolate' => ['Medium' => 80, 'Large' => 90],
            'Taro' => ['Medium' => 80, 'Large' => 90],

            // Coffee Series - Medium/Large
            'Coffee Capucino' => ['Medium' => 80, 'Large' => 90],
            'Coffee Caramel' => ['Medium' => 80, 'Large' => 90],
            'Salted Butter Caramel' => ['Medium' => 80, 'Large' => 90],

            // Smoothie Series - Regular only
            'Avocado' => ['Regular' => 100],

            // Fruit Tea Series - Regular only
            'Passion Fruit' => ['Regular' => 90],
            'Mango' => ['Regular' => 90],

            // Latte Series - Regular only
            'Ube' => ['Regular' => 60],

            // Fruit Soda Series - 16oz/22oz
            'Green Apple' => ['16oz' => 49, '22oz' => 90],
            'Lemon' => ['16oz' => 49, '22oz' => 90],
            'Honey Peach' => ['16oz' => 49, '22oz' => 90],
            'Blueberry' => ['16oz' => 49, '22oz' => 90],
            'Watermelon' => ['16oz' => 49, '22oz' => 90],
            'Orange' => ['16oz' => 49, '22oz' => 90],

            // Food - Regular only
            'Chicken Nuggets (5pcs)' => ['Regular' => 55],
            'Chicken Skin' => ['Regular' => 30],
            'Chicken Siomai (5pcs)' => ['Regular' => 30],
            'Chicken Shanghai (5pcs)' => ['Regular' => 30],
            'Chicken Siopao (2pcs)' => ['Regular' => 25],
            'Kikiam (8pcs)' => ['Regular' => 30],
            'Tofu (5pcs)' => ['Regular' => 35],
            'Fries' => ['Regular' => 30],
            'Super Jumbo Hotdog' => ['Regular' => 25],
            'Jumbo Hotdog' => ['Regular' => 20],
            'Cheesy Nachos' => ['Regular' => 30],
            'Cheesy Jolly Hotdog Sandwich' => ['Regular' => 35],
            'Chicken Wings With Savory Fries' => ['Regular' => 110],
            'Mineral Water' => ['Regular' => 10],
            'Coke' => ['Regular' => 25],
        ];

        foreach ($products as $product) {
            $categoryName = $product->category->name ?? '';
            $productName = $product->name;

            // Check if product has specific prices in the map
            if (isset($priceMap[$productName])) {
                foreach ($priceMap[$productName] as $size => $price) {
                    ProductSize::create([
                        'product_id' => $product->id,
                        'size' => $size,
                        'price' => $price,
                    ]);
                }
                continue;
            }

            // Default pricing based on category
            switch ($categoryName) {
                case 'Best Seller Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Medium', 'price' => 85]);
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Large', 'price' => 100]);
                    break;

                case 'Milk Tea Series':
                case 'Coffee Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Medium', 'price' => 80]);
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Large', 'price' => 90]);
                    break;

                case 'Smoothie Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Regular', 'price' => 100]);
                    break;

                case 'Fruit Tea Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Regular', 'price' => 90]);
                    break;

                case 'Latte Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Regular', 'price' => 60]);
                    break;

                case 'Fruit Soda Series':
                    ProductSize::create(['product_id' => $product->id, 'size' => '16oz', 'price' => 49]);
                    ProductSize::create(['product_id' => $product->id, 'size' => '22oz', 'price' => 90]);
                    break;

                case 'Food':
                    // Default food price
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Regular', 'price' => 30]);
                    break;

                default:
                    ProductSize::create(['product_id' => $product->id, 'size' => 'Regular', 'price' => 80]);
            }
        }
    }
}
