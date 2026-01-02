<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationFactory> */
    use HasFactory;

    protected $fillable = [
        'type',
        'user_id',
        'message',
        'read_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
