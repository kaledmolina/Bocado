<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address', 'phone', 'is_active', 'is_demo', 'is_hiring', 'waiters_can_collect_payment', 'security_waiter_activation', 'security_table_pin', 'security_require_physical_scan', 'client_can_call_waiter', 'primary_color', 'secondary_color', 'welcome_subtitle'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_demo' => 'boolean',
        'is_hiring' => 'boolean',
        'waiters_can_collect_payment' => 'boolean',
        'security_waiter_activation' => 'boolean',
        'security_table_pin' => 'boolean',
        'security_require_physical_scan' => 'boolean',
        'client_can_call_waiter' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'is_hiring' => false,
        'waiters_can_collect_payment' => true,
        'security_waiter_activation' => false,
        'security_table_pin' => false,
        'security_require_physical_scan' => false,
        'client_can_call_waiter' => true,
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function tables()
    {
        return $this->hasMany(Table::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function applications()
    {
        return $this->hasMany(RestaurantApplication::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function ratings()
    {
        return $this->hasMany(WaiterRating::class);
    }
}
