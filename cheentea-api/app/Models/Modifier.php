<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modifier extends Model
{
    /** @use HasFactory<\Database\Factories\ModifierFactory> */
    use HasFactory;

        protected $fillable = [
        'modifier_group_id',
        'name',
        'price_adjustment',
        'is_active',
        'sort_order',
    ];

    public function group()
    {
        return $this->belongsTo(ModifierGroup::class, 'modifier_group_id');
    }

    public function orderItemModifiers()
    {
        return $this->hasMany(OrderItemModifier::class);
    }
    
}
