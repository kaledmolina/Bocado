<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Restaurant;
use App\Models\Shift;
use App\Models\WaiterRating;
use App\Models\RestaurantApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WaiterPlatformController extends Controller
{
    public function startShift(Request $request)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || !$user->restaurant_id) {
            abort(403);
        }

        // Close any dangling shifts just in case
        Shift::where('user_id', $user->id)->whereNull('ended_at')->update(['ended_at' => now()]);

        Shift::create([
            'user_id' => $user->id,
            'restaurant_id' => $user->restaurant_id,
            'started_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Turno iniciado correctamente.');
    }

    public function endShift(Request $request, Shift $shift = null)
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            // Admin closing shift for a waiter
            $request->validate([
                'shift_id' => 'required|exists:shifts,id'
            ]);
            $shift = Shift::where('restaurant_id', $user->restaurant_id)
                ->whereNull('ended_at')
                ->findOrFail($request->shift_id);
        } else {
            // Waiter closing their own shift
            $shift = Shift::where('user_id', $user->id)
                ->whereNull('ended_at')
                ->firstOrFail();
        }

        $shift->update([
            'ended_at' => now()
        ]);

        return redirect()->back()->with('success', 'Turno finalizado correctamente.');
    }

    public function unlink(Request $request)
    {
        $user = Auth::user();
        if (!$user->isWaiter()) {
            abort(403);
        }

        if ($user->isDemoUser()) {
            return redirect()->back()->with('error', 'Como usuario de demostración, no puedes desvincularte del restaurante.');
        }

        if ($user->role === 'admin') {
            return redirect()->back()->with('error', 'Como administrador no puedes desvincularte de tu propio restaurante.');
        }

        // Close active shift
        Shift::where('user_id', $user->id)->whereNull('ended_at')->update(['ended_at' => now()]);

        // Unlink from restaurant
        $user->update([
            'restaurant_id' => null
        ]);

        return redirect()->route('waiter.dashboard')->with('success', 'Te has desvinculado del restaurante.');
    }

    public function apply(Request $request, Restaurant $restaurant)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || $user->restaurant_id) {
            abort(403, 'Ya perteneces a un restaurante.');
        }

        // Check if already applied
        $existing = RestaurantApplication::where('user_id', $user->id)
            ->where('restaurant_id', $restaurant->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Ya tienes una solicitud pendiente con este restaurante.');
        }

        RestaurantApplication::create([
            'user_id' => $user->id,
            'restaurant_id' => $restaurant->id,
            'status' => 'pending'
        ]);

        return redirect()->back()->with('success', 'Tu solicitud ha sido enviada al restaurante.');
    }

    public function processApplication(Request $request, RestaurantApplication $application)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $application->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $application->update([
            'status' => $validated['status']
        ]);

        if ($validated['status'] === 'approved') {
            // Link waiter to restaurant and activate them
            $waiter = $application->user;
            $waiter->update([
                'restaurant_id' => $user->restaurant_id,
                'is_active' => true
            ]);

            // Cancel other pending applications for this waiter
            RestaurantApplication::where('user_id', $waiter->id)
                ->where('id', '!=', $application->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);
        }

        $msg = $validated['status'] === 'approved' ? 'Solicitud aprobada y mesero vinculado.' : 'Solicitud rechazada.';
        return redirect()->back()->with('success', $msg);
    }

    public function toggleHiring(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $restaurant = $user->restaurant;
        $restaurant->update([
            'is_hiring' => !$restaurant->is_hiring
        ]);

        $msg = $restaurant->is_hiring ? 'Búsqueda de meseros activada.' : 'Búsqueda de meseros desactivada.';
        return redirect()->back()->with('success', $msg);
    }

    public function rateWaiter(Request $request, User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            abort(403);
        }

        if ($waiter->isDemoUser()) {
            return redirect()->back()->with('error', 'No puedes despedir o desvincular a un mesero de demostración.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500'
        ]);

        // Save rating
        WaiterRating::create([
            'waiter_id' => $waiter->id,
            'restaurant_id' => $user->restaurant_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment']
        ]);

        // Close shifts
        Shift::where('user_id', $waiter->id)->whereNull('ended_at')->update(['ended_at' => now()]);

        // Dismiss waiter
        $waiter->update([
            'restaurant_id' => null
        ]);

        return redirect()->back()->with('success', 'Contrato finalizado y mesero calificado.');
    }

    public function hireWaiter(Request $request, User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || !$waiter->isWaiter()) {
            abort(403);
        }

        if ($waiter->restaurant_id) {
            return redirect()->back()->with('error', 'El mesero ya está vinculado a otro restaurante.');
        }

        // Check if already invited or applied
        $existing = RestaurantApplication::where('user_id', $waiter->id)
            ->where('restaurant_id', $user->restaurant_id)
            ->whereIn('status', ['pending', 'invited'])
            ->first();

        if ($existing) {
            if ($existing->status === 'invited') {
                return redirect()->back()->with('error', 'Ya has enviado una oferta a este mesero.');
            }
            // If they applied, approve it!
            $existing->update(['status' => 'approved']);
            $waiter->update([
                'restaurant_id' => $user->restaurant_id,
                'is_active' => true
            ]);
            return redirect()->back()->with('success', 'Solicitud aprobada y mesero contratado.');
        }

        // Send job proposal (invited)
        RestaurantApplication::create([
            'user_id' => $waiter->id,
            'restaurant_id' => $user->restaurant_id,
            'status' => 'invited'
        ]);

        return redirect()->back()->with('success', 'Oferta de empleo enviada al mesero.');
    }

    public function acceptInvitation(Request $request, RestaurantApplication $application)
    {
        $user = Auth::user();
        if ($application->user_id !== $user->id || $application->status !== 'invited') {
            abort(403);
        }

        // Link waiter
        $user->update([
            'restaurant_id' => $application->restaurant_id,
            'is_active' => true
        ]);

        $application->update(['status' => 'approved']);

        // Reject other pending/invited applications
        RestaurantApplication::where('user_id', $user->id)
            ->where('id', '!=', $application->id)
            ->whereIn('status', ['pending', 'invited'])
            ->update(['status' => 'rejected']);

        return redirect()->route('waiter.dashboard')->with('success', 'Oferta aceptada. ¡Bienvenido al restaurante!');
    }

    public function rejectInvitation(Request $request, RestaurantApplication $application)
    {
        $user = Auth::user();
        if ($application->user_id !== $user->id || $application->status !== 'invited') {
            abort(403);
        }

        $application->update(['status' => 'rejected']);

        return redirect()->route('waiter.dashboard')->with('success', 'Oferta de empleo rechazada.');
    }

    public function updateProfileSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user->isWaiter()) {
            abort(403);
        }

        if ($user->isDemoUser()) {
            return redirect()->back()->with('error', 'No puedes modificar el perfil de un usuario de demostración.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:50',
            'is_visible_in_talents' => 'required|boolean',
            'city' => 'nullable|string|max:100',
            'birthday' => 'nullable|date',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|string|max:500',
            'experience_description' => 'nullable|string|max:1000',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'is_visible_in_talents' => $validated['is_visible_in_talents'],
            'city' => $validated['city'],
            'birthday' => $validated['birthday'],
            'bio' => $validated['bio'],
            'skills' => $validated['skills'],
            'experience_description' => $validated['experience_description'],
        ]);

        return redirect()->back()->with('success', 'Configuración de perfil actualizada.');
    }
}
