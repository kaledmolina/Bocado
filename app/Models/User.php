<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'restaurant_id', 'is_active', 'phone', 'is_visible_in_talents', 'city', 'birthday', 'bio', 'skills', 'experience_description'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $attributes = [
        'is_active' => true,
        'is_visible_in_talents' => true,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $appends = ['experience_hours', 'average_rating'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_visible_in_talents' => 'boolean',
        ];
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class, 'user_id');
    }

    public function ratings()
    {
        return $this->hasMany(WaiterRating::class, 'waiter_id');
    }

    public function applications()
    {
        return $this->hasMany(RestaurantApplication::class, 'user_id');
    }

    public function getExperienceHoursAttribute()
    {
        $shifts = $this->shifts()->get();
        $totalMinutes = 0;
        foreach ($shifts as $shift) {
            $end = $shift->ended_at ?: now();
            $totalMinutes += $shift->started_at->diffInMinutes($end);
        }
        return round($totalMinutes / 60, 1);
    }

    public function getAverageRatingAttribute()
    {
        $ratings = $this->ratings();
        if ($ratings->count() === 0) {
            return 0;
        }
        return round($ratings->avg('rating'), 1);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin()
    {
        return $this->role === 'admin' && session('view_mode', 'admin') !== 'waiter';
    }

    public function isWaiter()
    {
        return $this->role === 'waiter' || ($this->role === 'admin' && session('view_mode', 'admin') === 'waiter');
    }
}
