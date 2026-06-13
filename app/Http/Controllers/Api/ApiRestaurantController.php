<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiRestaurantController extends Controller
{
    /**
     * Get details of a single restaurant.
     */
    public function show($id)
    {
        $restaurant = Restaurant::withCount(['tables', 'users as waiters_count' => function ($q) {
            $q->where('role', 'waiter');
        }])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $restaurant
        ]);
    }

    /**
     * Get the restaurant's menu catalog.
     */
    public function menu($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $products = $restaurant->products()->where('is_active', true)->get();

        // Group by category helper
        $categories = $products->groupBy('category');

        return response()->json([
            'status' => 'success',
            'data' => [
                'restaurant_name' => $restaurant->name,
                'categories' => $categories
            ]
        ]);
    }

    /**
     * Toggle the hiring status of the restaurant.
     */
    public function toggleHiring(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No autorizado'
            ], 403);
        }

        $restaurant = $user->restaurant;
        if (!$restaurant) {
            return response()->json([
                'status' => 'error',
                'message' => 'No perteneces a ningún restaurante'
            ], 404);
        }

        $restaurant->update([
            'is_hiring' => !$restaurant->is_hiring
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $restaurant->is_hiring ? 'Búsqueda de meseros activada.' : 'Búsqueda de meseros desactivada.',
            'data' => [
                'is_hiring' => $restaurant->is_hiring
            ]
        ]);
    }

    /**
     * List all restaurants looking for talent (Job Board).
     */
    public function jobs()
    {
        $hiringRestaurants = Restaurant::where('is_hiring', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $hiringRestaurants
        ]);
    }
}
