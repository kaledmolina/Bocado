<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableLog extends Model
{
    protected $fillable = [
        'restaurant_id',
        'table_id',
        'user_id',
        'action',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
