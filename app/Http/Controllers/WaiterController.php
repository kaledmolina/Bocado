<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\RestaurantApplication;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class WaiterController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $waiters = User::where('restaurant_id', $user->restaurant_id)
            ->where('role', 'waiter')
            ->with(['shifts' => function($q) {
                $q->whereNull('ended_at');
            }, 'ratings.restaurant'])
            ->get();

        $applications = RestaurantApplication::where('restaurant_id', $user->restaurant_id)
            ->where('status', 'pending')
            ->with('user.ratings.restaurant')
            ->get();

        $invitationToken = Crypt::encryptString((string)$user->restaurant_id);
        $invitationLink = route('waiter.invite', ['token' => $invitationToken]);

        $availableWaiters = User::whereNull('restaurant_id')
            ->where('role', 'waiter')
            ->where('is_visible_in_talents', true)
            ->whereNotIn('email', ['owner@rinconcito.com', 'pedro@rinconcito.com', 'maria@rinconcito.com', 'owner@tacoloco.com', 'carlos@tacoloco.com'])
            ->with(['ratings.restaurant', 'applications' => function($q) use ($user) {
                $q->where('restaurant_id', $user->restaurant_id);
            }])
            ->get();

        return Inertia::render('Admin/Waiters', [
            'waiters' => $waiters,
            'applications' => $applications,
            'restaurant' => $user->restaurant,
            'invitationLink' => $invitationLink,
            'availableWaiters' => $availableWaiters,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'waiter',
            'restaurant_id' => $user->restaurant_id,
        ]);

        return redirect()->back()->with('success', 'Mesero creado exitosamente.');
    }

    public function update(Request $request, User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            abort(403);
        }

        if ($waiter->isDemoUser()) {
            return redirect()->back()->with('error', 'No puedes modificar los datos de un mesero de demostración.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $waiter->id,
            'password' => ['nullable', Rules\Password::defaults()],
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $waiter->update($data);

        return redirect()->back()->with('success', 'Mesero actualizado exitosamente.');
    }

    public function destroy(User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            abort(403);
        }

        if ($waiter->isDemoUser()) {
            return redirect()->back()->with('error', 'No puedes eliminar a un mesero de demostración.');
        }

        $waiter->delete();

        return redirect()->back()->with('success', 'Mesero eliminado exitosamente.');
    }

    public function showInviteForm($token)
    {
        try {
            $restaurantId = Crypt::decryptString($token);
            $restaurant = Restaurant::findOrFail($restaurantId);
        } catch (DecryptException $e) {
            abort(404, 'Enlace de invitación inválido o vencido.');
        }

        return Inertia::render('Waiter/Register', [
            'restaurantName' => $restaurant->name,
            'token' => $token,
        ]);
    }

    public function registerFromInvite(Request $request, $token)
    {
        try {
            $restaurantId = Crypt::decryptString($token);
            $restaurant = Restaurant::findOrFail($restaurantId);
        } catch (DecryptException $e) {
            abort(404, 'Enlace de invitación inválido o vencido.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'waiter',
            'restaurant_id' => $restaurant->id,
            'is_active' => false, // Requires admin approval
        ]);

        return redirect()->route('waiter.invite.pending');
    }

    public function invitePending()
    {
        return Inertia::render('Waiter/InvitePending');
    }

    public function toggleStatus(User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            abort(403);
        }

        if ($waiter->isDemoUser()) {
            return redirect()->back()->with('error', 'No puedes desactivar a un mesero de demostración.');
        }

        $waiter->update([
            'is_active' => !$waiter->is_active
        ]);

        $statusMessage = $waiter->is_active ? 'Mesero aprobado y activado.' : 'Mesero desactivado.';
        return redirect()->back()->with('success', $statusMessage);
    }
}
