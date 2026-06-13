<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ApiAuthController extends Controller
{
    /**
     * Register a new user (waiter or restaurant admin/owner).
     */
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:waiter,admin',
            'phone' => 'nullable|string',
            'city' => 'nullable|string',
            'birthday' => 'nullable|date',
        ]);

        $role = $fields['role'] ?? 'waiter';

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role' => $role,
            'phone' => $fields['phone'] ?? null,
            'city' => $fields['city'] ?? null,
            'birthday' => $fields['birthday'] ?? null,
            'is_active' => true,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'data' => [
                'token' => $token,
                'user' => $user->load('restaurant'),
            ]
        ], 210); // Or 201 Created
    }

    /**
     * Authenticate and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Esta cuenta ha sido desactivada por el administrador.'
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => $user->load('restaurant'),
            ]
        ]);
    }

    /**
     * Get details of the authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'status' => 'success',
            'data' => $user->load(['restaurant', 'ratings', 'shifts' => function ($q) {
                $q->latest()->limit(5);
            }])
        ]);
    }

    /**
     * Revoke active token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Tokens revoked'
        ]);
    }
}
