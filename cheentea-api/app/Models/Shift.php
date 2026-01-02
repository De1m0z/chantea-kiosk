<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    /** @use HasFactory<\Database\Factories\ShiftFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'opening_cash',
        'closing_cash',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
