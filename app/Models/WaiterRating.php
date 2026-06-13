<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaiterRating extends Model
{
    protected $fillable = ['waiter_id', 'restaurant_id', 'rating', 'comment'];

    public function waiter()
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
