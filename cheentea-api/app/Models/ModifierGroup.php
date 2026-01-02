<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModifierGroup extends Model
{
    /** @use HasFactory<\Database\Factories\ModifierGroupFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'min_select',
        'max_select',
        'required',
        'sort_order',
    ];

    public function modifiers()
    {
        return $this->hasMany(Modifier::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_modifiers');
    }


}
