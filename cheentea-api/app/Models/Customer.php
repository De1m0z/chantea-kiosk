<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class Customer extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'username',
        'password',
        'loyalty_points',
        'tier',
        'stamps',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Check if customer can redeem a free drink.
     */
    public function canRedeemFreeDrink(): bool
    {
        return $this->stamps >= 10;
    }

    /**
     * Redeem 10 stamps for a free drink.
     */
    public function redeemFreeDrink(): bool
    {
        if (!$this->canRedeemFreeDrink()) {
            return false;
        }
        
        $this->stamps -= 10;
        $this->save();
        return true;
    }

    /**
     * Award stamps to customer.
     */
    public function awardStamps(int $count): void
    {
        $this->stamps += $count;
        $this->save();
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function summary()
    {
        return $this->hasOne(CustomerOrder::class);
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmail);
    }
}
