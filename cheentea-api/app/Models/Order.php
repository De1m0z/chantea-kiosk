<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    // Setting timestamps to false means Laravel will not manage
    // 'created_at' or 'updated_at'. If you only have 'created_at',
    // consider setting 'const UPDATED_AT = null;' and keeping default timestamps.
    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'user_id',
        'status',
        'pending_stamps',
        'loyalty_customer_id',
        'stamps_awarded',
        'order_type',
        'subtotal',
        'tax',
        'discount',
        'total',
    ];

    /**
     * The customer who placed the order (via customer_id).
     */
    public function customer(): BelongsTo
    {
        // Requires App\Models\Customer
        return $this->belongsTo(Customer::class);
    }

    /**
     * The staff member (cashier) who processed the order (via user_id).
     * We keep 'cashier' for clarity.
     */
    public function cashier(): BelongsTo
    {
        // Requires App\Models\User
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * All items belonging to this order.
     */
    public function items(): HasMany
    {
        // Requires App\Models\OrderItem
        return $this->hasMany(OrderItem::class);
    }

    /**
     * All payments made against this order.
     */
    public function payments(): HasMany
    {
        // Requires App\Models\Payment
        return $this->hasMany(Payment::class);
    }
}
