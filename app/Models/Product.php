<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['restaurant_id', 'name', 'description', 'price', 'category', 'is_available', 'image_path'];

    protected $casts = [
        'is_available' => 'boolean',
        'price' => 'float',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
