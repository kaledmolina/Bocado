<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $products = Product::where('restaurant_id', $user->restaurant_id)->get();

        return Inertia::render('Admin/Products', [
            'products' => $products
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
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'is_available' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imagePath = '/storage/' . $path;
        } elseif ($request->filled('image_url')) {
            $imagePath = $request->input('image_url');
        }

        Product::create(array_merge($validated, [
            'restaurant_id' => $user->restaurant_id,
            'image_path' => $imagePath
        ]));

        return redirect()->back()->with('success', 'Producto creado exitosamente.');
    }

    public function update(Request $request, Product $product)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $product->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'is_available' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|string|max:2048', // Allow URL string or empty
        ]);

        $imagePath = $product->image_path;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imagePath = '/storage/' . $path;
            if ($product->image_path && str_starts_with($product->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $product->image_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
        } elseif ($request->has('image_url')) {
            $imagePath = $request->input('image_url') ?: null;
            if ($product->image_path && $imagePath !== $product->image_path && str_starts_with($product->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $product->image_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
        }

        $product->update(array_merge($validated, [
            'image_path' => $imagePath
        ]));

        return redirect()->back()->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $product)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $product->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Producto eliminado exitosamente.');
    }
}
