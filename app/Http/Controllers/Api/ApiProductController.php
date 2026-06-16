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
     * Create a new product.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->isWaiter()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized role'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'is_available' => 'required|boolean',
            'image_url' => 'nullable|url'
        ]);

        $product = new Product();
        $product->restaurant_id = $user->restaurant_id;
        $product->name = $validated['name'];
        $product->description = $validated['description'] ?? null;
        $product->price = $validated['price'];
        $product->category = $validated['category'];
        $product->is_available = $validated['is_available'];
        $product->image_path = $validated['image_url'] ?? null;
        
        $product->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
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
