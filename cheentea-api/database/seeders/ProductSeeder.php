<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bestSeller = Category::where('name', 'Best Seller Series')->first();
        $milkTea = Category::where('name', 'Milk Tea Series')->first();
        $coffee = Category::where('name', 'Coffee Series')->first();
        $smoothie = Category::where('name', 'Smoothie Series')->first();
        $fruitTea = Category::where('name', 'Fruit Tea Series')->first();
        $latte = Category::where('name', 'Latte Series')->first();
        $fruitSoda = Category::where('name', 'Fruit Soda Series')->first();
        $food = Category::where('name', 'Food')->first();

        $products = [
            // Best Seller Series (6 products)
            ['category_id' => $bestSeller->id, 'name' => 'Red Velvet', 'description' => 'Rich red velvet milk tea', 'sku' => 'BS001', 'is_active' => true],
            ['category_id' => $bestSeller->id, 'name' => 'Choco Cheese Cake', 'description' => 'Chocolate cheesecake milk tea', 'sku' => 'BS002', 'is_active' => true],
            ['category_id' => $bestSeller->id, 'name' => 'Wintermelon', 'description' => 'Sweet wintermelon milk tea', 'sku' => 'BS003', 'is_active' => true],
            ['category_id' => $bestSeller->id, 'name' => 'Cookies and Cream', 'description' => 'Cookies and cream milk tea', 'sku' => 'BS004', 'is_active' => true],
            ['category_id' => $bestSeller->id, 'name' => 'Choco Nutella', 'description' => 'Chocolate nutella milk tea', 'sku' => 'BS005', 'is_active' => true],
            ['category_id' => $bestSeller->id, 'name' => 'Strawberry Nutella', 'description' => 'Strawberry nutella milk tea', 'sku' => 'BS006', 'is_active' => true],

            // Milk Tea Series (11 products)
            ['category_id' => $milkTea->id, 'name' => 'Classic', 'description' => 'Classic milk tea', 'sku' => 'MT001', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'White Rabbit', 'description' => 'White rabbit candy milk tea', 'sku' => 'MT002', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Strawberry', 'description' => 'Strawberry milk tea', 'sku' => 'MT003', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Thai Rose', 'description' => 'Thai rose milk tea', 'sku' => 'MT004', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Matcha', 'description' => 'Japanese matcha milk tea', 'sku' => 'MT005', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Okinawa', 'description' => 'Okinawa brown sugar milk tea', 'sku' => 'MT006', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'RockSalt & Cheese', 'description' => 'Rock salt and cheese milk tea', 'sku' => 'MT007', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Hokaido', 'description' => 'Hokkaido milk tea', 'sku' => 'MT008', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Milky Banana', 'description' => 'Milky banana milk tea', 'sku' => 'MT009', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Chocolate', 'description' => 'Chocolate milk tea', 'sku' => 'MT010', 'is_active' => true],
            ['category_id' => $milkTea->id, 'name' => 'Taro', 'description' => 'Taro milk tea', 'sku' => 'MT011', 'is_active' => true],

            // Coffee Series (3 products)
            ['category_id' => $coffee->id, 'name' => 'Coffee Capucino', 'description' => 'Classic cappuccino', 'sku' => 'CF001', 'is_active' => true],
            ['category_id' => $coffee->id, 'name' => 'Coffee Caramel', 'description' => 'Caramel coffee', 'sku' => 'CF002', 'is_active' => true],
            ['category_id' => $coffee->id, 'name' => 'Salted Butter Caramel', 'description' => 'Salted butter caramel coffee', 'sku' => 'CF003', 'is_active' => true],

            // Smoothie Series (4 products)
            ['category_id' => $smoothie->id, 'name' => 'Avocado', 'description' => 'Creamy avocado smoothie', 'sku' => 'SM001', 'is_active' => true],
            ['category_id' => $smoothie->id, 'name' => 'Cookies and Cream', 'description' => 'Cookies and cream smoothie', 'sku' => 'SM002', 'is_active' => true],
            ['category_id' => $smoothie->id, 'name' => 'Passion Fruit', 'description' => 'Passion fruit smoothie', 'sku' => 'SM003', 'is_active' => true],
            ['category_id' => $smoothie->id, 'name' => 'Red Velvet', 'description' => 'Red velvet smoothie', 'sku' => 'SM004', 'is_active' => true],

            // Fruit Tea Series (3 products)
            ['category_id' => $fruitTea->id, 'name' => 'Passion Fruit', 'description' => 'Passion fruit tea', 'sku' => 'FT001', 'is_active' => true],
            ['category_id' => $fruitTea->id, 'name' => 'Strawberry', 'description' => 'Strawberry fruit tea', 'sku' => 'FT002', 'is_active' => true],
            ['category_id' => $fruitTea->id, 'name' => 'Mango', 'description' => 'Mango fruit tea', 'sku' => 'FT003', 'is_active' => true],

            // Latte Series (3 products)
            ['category_id' => $latte->id, 'name' => 'Matcha', 'description' => 'Matcha latte', 'sku' => 'LT001', 'is_active' => true],
            ['category_id' => $latte->id, 'name' => 'Ube', 'description' => 'Ube latte', 'sku' => 'LT002', 'is_active' => true],
            ['category_id' => $latte->id, 'name' => 'Strawberry', 'description' => 'Strawberry latte', 'sku' => 'LT003', 'is_active' => true],

            // Fruit Soda Series (9 products)
            ['category_id' => $fruitSoda->id, 'name' => 'Mango', 'description' => 'Mango fruit soda', 'sku' => 'FS001', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Green Apple', 'description' => 'Green apple fruit soda', 'sku' => 'FS002', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Lemon', 'description' => 'Lemon fruit soda', 'sku' => 'FS003', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Honey Peach', 'description' => 'Honey peach fruit soda', 'sku' => 'FS004', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Blueberry', 'description' => 'Blueberry fruit soda', 'sku' => 'FS005', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Watermelon', 'description' => 'Watermelon fruit soda', 'sku' => 'FS006', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Strawberry', 'description' => 'Strawberry fruit soda', 'sku' => 'FS007', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Orange', 'description' => 'Orange fruit soda', 'sku' => 'FS008', 'is_active' => true],
            ['category_id' => $fruitSoda->id, 'name' => 'Passion Fruit', 'description' => 'Passion fruit soda', 'sku' => 'FS009', 'is_active' => true],

            // Food (14 products)
            ['category_id' => $food->id, 'name' => 'Chicken Nuggets (5pcs)', 'description' => 'Crispy chicken nuggets', 'sku' => 'FD001', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Chicken Skin', 'description' => 'Crispy fried chicken skin', 'sku' => 'FD002', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Chicken Siomai (5pcs)', 'description' => 'Steamed chicken siomai', 'sku' => 'FD003', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Chicken Shanghai (5pcs)', 'description' => 'Fried chicken shanghai rolls', 'sku' => 'FD004', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Chicken Siopao (2pcs)', 'description' => 'Steamed chicken buns', 'sku' => 'FD005', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Kikiam (8pcs)', 'description' => 'Fried kikiam', 'sku' => 'FD006', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Tofu (5pcs)', 'description' => 'Fried tofu', 'sku' => 'FD007', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Fries', 'description' => 'Crispy french fries', 'sku' => 'FD008', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Super Jumbo Hotdog', 'description' => 'Super jumbo hotdog on stick', 'sku' => 'FD009', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Jumbo Hotdog', 'description' => 'Jumbo hotdog on stick', 'sku' => 'FD010', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Cheesy Nachos', 'description' => 'Nachos with cheese sauce', 'sku' => 'FD011', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Cheesy Jolly Hotdog Sandwich', 'description' => 'Hotdog sandwich with cheese', 'sku' => 'FD012', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Chicken Wings With Savory Fries', 'description' => 'Chicken wings combo with fries', 'sku' => 'FD013', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Mineral Water', 'description' => 'Bottled mineral water', 'sku' => 'FD014', 'is_active' => true],
            ['category_id' => $food->id, 'name' => 'Coke', 'description' => 'Coca-cola beverage', 'sku' => 'FD015', 'is_active' => true],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
