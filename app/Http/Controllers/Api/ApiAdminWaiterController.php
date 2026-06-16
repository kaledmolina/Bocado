<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\RestaurantApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\Rules;

class ApiAdminWaiterController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
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
            ->with(['ratings.restaurant', 'applications' => function($q) use ($user) {
                $q->where('restaurant_id', $user->restaurant_id);
            }])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'waiters' => $waiters,
                'applications' => $applications,
                'restaurant' => $user->restaurant,
                'invitationLink' => $invitationLink,
                'availableWaiters' => $availableWaiters,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', Rules\Password::defaults()],
        ]);

        $waiter = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'waiter',
            'restaurant_id' => $user->restaurant_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mesero creado exitosamente.',
            'data' => $waiter
        ]);
    }

    public function update(Request $request, User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            return response()->json(['message' => 'Forbidden'], 403);
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

        return response()->json([
            'status' => 'success',
            'message' => 'Mesero actualizado exitosamente.',
            'data' => $waiter
        ]);
    }

    public function destroy(User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $waiter->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mesero eliminado exitosamente.'
        ]);
    }

    public function toggleStatus(User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $waiter->restaurant_id !== $user->restaurant_id || !$waiter->isWaiter()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $waiter->update([
            'is_active' => !$waiter->is_active
        ]);

        $statusMessage = $waiter->is_active ? 'Mesero aprobado y activado.' : 'Mesero desactivado.';
        return response()->json([
            'status' => 'success',
            'message' => $statusMessage,
            'data' => $waiter
        ]);
    }

    public function processApplication(Request $request, RestaurantApplication $application)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $application->restaurant_id !== $user->restaurant_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $application->update([
            'status' => $validated['status']
        ]);

        if ($validated['status'] === 'approved') {
            $waiter = $application->user;
            $waiter->update([
                'restaurant_id' => $user->restaurant_id,
                'is_active' => true
            ]);

            RestaurantApplication::where('user_id', $waiter->id)
                ->where('id', '!=', $application->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);
        }

        $msg = $validated['status'] === 'approved' ? 'Solicitud aprobada y mesero vinculado.' : 'Solicitud rechazada.';
        return response()->json([
            'status' => 'success',
            'message' => $msg
        ]);
    }

    public function hireWaiter(Request $request, User $waiter)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || !$waiter->isWaiter()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($waiter->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'El mesero ya está vinculado a otro restaurante.'], 400);
        }

        $existing = RestaurantApplication::where('user_id', $waiter->id)
            ->where('restaurant_id', $user->restaurant_id)
            ->whereIn('status', ['pending', 'invited'])
            ->first();

        if ($existing) {
            if ($existing->status === 'invited') {
                return response()->json(['status' => 'error', 'message' => 'Ya has enviado una oferta a este mesero.'], 400);
            }
            $existing->update(['status' => 'approved']);
            $waiter->update([
                'restaurant_id' => $user->restaurant_id,
                'is_active' => true
            ]);
            return response()->json(['status' => 'success', 'message' => 'Solicitud aprobada y mesero contratado.']);
        }

        RestaurantApplication::create([
            'user_id' => $waiter->id,
            'restaurant_id' => $user->restaurant_id,
            'status' => 'invited'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Oferta de empleo enviada al mesero.']);
    }
}
