<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shift;
use App\Models\Restaurant;
use App\Models\RestaurantApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiWaiterController extends Controller
{
    /**
     * Start waiter shift.
     */
    public function startShift()
    {
        $user = Auth::user();
        if (!$user->isWaiter() || !$user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No estás vinculado a ningún restaurante o no eres mesero'], 403);
        }

        // Close dangling shifts
        Shift::where('user_id', $user->id)->whereNull('ended_at')->update(['ended_at' => now()]);

        $shift = Shift::create([
            'user_id' => $user->id,
            'restaurant_id' => $user->restaurant_id,
            'started_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Turno iniciado correctamente.',
            'data' => $shift
        ]);
    }

    /**
     * End waiter shift.
     */
    public function endShift()
    {
        $user = Auth::user();

        $shift = Shift::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        if (!$shift) {
            return response()->json(['status' => 'error', 'message' => 'No tienes ningún turno activo para finalizar'], 404);
        }

        $shift->update([
            'ended_at' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Turno finalizado correctamente.',
            'data' => $shift
        ]);
    }

    /**
     * Apply to a hiring restaurant.
     */
    public function apply(Restaurant $restaurant)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'Ya perteneces a un restaurante u opción no disponible'], 403);
        }

        $existing = RestaurantApplication::where('user_id', $user->id)
            ->where('restaurant_id', $restaurant->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['status' => 'error', 'message' => 'Ya tienes una solicitud pendiente con este restaurante.'], 400);
        }

        $app = RestaurantApplication::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => 'pending'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Tu solicitud ha sido enviada al restaurante.',
            'data' => $app
        ]);
    }

    /**
     * Get waiter's ratings, active shift status, total experience and application list.
     */
    public function profile()
    {
        $user = Auth::user();
        if (!$user->isWaiter()) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $activeShift = Shift::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'city' => $user->city,
                'birthday' => $user->birthday,
                'bio' => $user->bio,
                'skills' => $user->skills,
                'experience_description' => $user->experience_description,
                'experience_hours' => $user->experience_hours,
                'average_rating' => $user->average_rating,
                'restaurant' => $user->restaurant,
                'active_shift' => $activeShift,
                'applications' => RestaurantApplication::where('user_id', $user->id)->with('restaurant')->get()
            ]
        ]);
    }
}
