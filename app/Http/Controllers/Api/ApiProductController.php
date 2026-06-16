<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ApiProductController extends Controller
{
    /**
     * Get all products for the authenticated admin's restaurant.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isWaiter()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized role'
            ], 403);
        }

        $restaurantId = $user->restaurant_id;

        $products = Product::where('restaurant_id', $restaurantId)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Toggle the availability of a specific product.
     */
    public function toggleAvailability(Request $request, $id)
    {
        $user = $request->user();

        if ($user->isWaiter()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized role'
            ], 403);
        }

        $product = Product::where('restaurant_id', $user->restaurant_id)
            ->where('id', $id)
            ->firstOrFail();

        $product->is_available = !$product->is_available;
        $product->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Product availability updated.',
            'data' => $product
        ]);
    }
}
