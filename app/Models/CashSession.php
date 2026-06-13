<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashSession extends Model
{
    protected $fillable = [
        'restaurant_id',
        'user_id',
        'opened_at',
        'closed_at',
        'opening_balance',
        'opening_paid_amount_reference',
        'expected_amount',
        'real_amount',
        'difference'
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_balance' => 'float',
        'opening_paid_amount_reference' => 'float',
        'expected_amount' => 'float',
        'real_amount' => 'float',
        'difference' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
