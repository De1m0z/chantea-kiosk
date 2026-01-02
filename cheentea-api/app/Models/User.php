<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customer; // <<< ADDED: Explicitly import Customer model

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
        'google_id',
        'avatar',
        'customer_id', // Links Customer Login User to their Customer record
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- Core Relationships ---

    public function orders(): HasMany
    {
        // Users can place orders (either as staff or as the logged-in customer)
        return $this->hasMany(Order::class);
    }

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // --- Customer-Specific Relationships ---

    /**
     * This relationship is for Users who are CUSTOMERS.
     * RENAMED from customerProfile() to customer() to match $user->customer access in the controller.
     * It connects the User's login account (which holds customer_id)
     * to their corresponding record in the 'customers' table.
     */
    public function customer(): BelongsTo
    {
        // Using 'customer_id' as the foreign key on the User model
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * This relationship is for Users who are STAFF/ADMINS.
     * It connects the staff User to the multiple Customer records they may manage.
     * The foreign key ('user_id') is on the Customer table.
     */
    public function managedCustomers(): HasMany
    {
        return $this->hasMany(Customer::class, 'user_id');
    }
}
