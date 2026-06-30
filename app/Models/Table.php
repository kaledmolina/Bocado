<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Table extends Model
{
    use HasFactory;

    protected $fillable = ['restaurant_id', 'number', 'qr_code_token', 'status', 'cart_data', 'is_active_for_order', 'temp_pin', 'pin_updated_at', 'pin_requested'];

    protected $casts = [
        'cart_data' => 'array',
        'is_active_for_order' => 'boolean',
        'pin_updated_at' => 'datetime',
        'pin_requested' => 'boolean',
    ];

    public function generateTempPin()
    {
        $this->temp_pin = str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        $this->pin_updated_at = now();
        $this->pin_requested = false;
        $this->save();
    }

    public function getOrGenerateDynamicPin($force = false)
    {
        if (!$this->is_active_for_order) {
            return null;
        }

        if ($force || empty($this->temp_pin) || empty($this->pin_updated_at) || now()->diffInMinutes($this->pin_updated_at) >= 5) {
            $this->temp_pin = str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
            $this->pin_updated_at = now();
            $this->save();
        }

        return $this->temp_pin;
    }

    public function clearTempPin()
    {
        $this->temp_pin = null;
        $this->pin_updated_at = null;
        $this->pin_requested = false;
        $this->is_active_for_order = false;
        $this->save();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($table) {
            if (empty($table->qr_code_token)) {
                $table->qr_code_token = Str::random(32);
            }
        });
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function activeOrder()
    {
        return $this->hasOne(Order::class)->where('status', 'pending');
    }

    public function activeOrders()
    {
        return $this->hasMany(Order::class)->where('status', 'pending');
    }
}
