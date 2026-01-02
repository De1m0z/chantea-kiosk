<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;


    protected $fillable = [
        'category_id',
        'name',
        'description',
        'base_price',
        'sku',
        'is_active',
        'image_url',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function modifierGroups()
    {
        return $this->belongsToMany(ModifierGroup::class, 'product_modifiers');
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'product_ingredients')->withPivot('quantity_required');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

        public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

}
