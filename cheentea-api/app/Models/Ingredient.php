<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    /** @use HasFactory<\Database\Factories\IngredientFactory> */
    use HasFactory;


    protected $fillable = [
        'name',
        'unit_of_measure',
        'cost_per_unit',
        'current_stock',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_ingredients')->withPivot('quantity_required');
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

}
