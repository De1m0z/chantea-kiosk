<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryTransactionFactory> */
    use HasFactory;
    protected $fillable = [
        'ingredient_id',
        'type',
        'quantity',
        'user_id',
        'order_id',
    ];

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
