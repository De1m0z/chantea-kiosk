<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerOrder extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerOrderFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'total_spent',
        'last_order_date',
        'lifetime_orders',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
