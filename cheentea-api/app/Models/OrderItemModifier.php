<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemModifier extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemModifierFactory> */
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'modifier_id',
        'price_adjustment',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function modifier()
    {
        return $this->belongsTo(Modifier::class);
    }
}
