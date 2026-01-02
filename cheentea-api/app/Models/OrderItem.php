<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemFactory> */
    use HasFactory;

        protected $fillable = [
        'order_id',
        'product_id',
        'product_size_id',
        'quantity',
        'unit_price',
        'line_total',
        'is_free_reward',
        'status',
    ];

    protected $casts = [
        'is_free_reward' => 'boolean',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function modifiers()
    {
        return $this->hasMany(OrderItemModifier::class);
    }
    public function productSize()
    {
        return $this->belongsTo(ProductSize::class, 'product_size_id');
    }
    
}
