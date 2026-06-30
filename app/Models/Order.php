<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_id',
        'waiter_id',
        'customer_name',
        'table_id',
        'status',
        'total_amount',
        'received_amount',
        'change_amount',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'received_amount' => 'float',
        'change_amount' => 'float',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function waiter()
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
