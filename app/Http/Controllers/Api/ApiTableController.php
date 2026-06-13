<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiTableController extends Controller
{
    /**
     * Public QR Code scanning endpoint.
     */
    public function scan($qr_code_token)
    {
        $table = Table::where('qr_code_token', $qr_code_token)->firstOrFail();
        $restaurant = $table->restaurant;

        // Auto-generate PIN if table PIN security is enabled
        if ($restaurant->security_table_pin) {
            $table->getOrGenerateDynamicPin();
            $table->refresh();
        }

        $products = Product::where('restaurant_id', $table->restaurant_id)
            ->where('is_available', true)
            ->get()
            ->groupBy('category');

        $activeOrder = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->with('items.product')
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'table' => $table,
                'restaurant' => $restaurant,
                'categories' => $products,
                'active_order' => $activeOrder,
            ]
        ]);
    }

    /**
     * List all tables in the restaurant (Authenticated Admin/Waiter).
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No perteneces a ningún restaurante'], 404);
        }

        $tables = Table::where('restaurant_id', $user->restaurant_id)->get();

        return response()->json([
            'status' => 'success',
            'data' => $tables
        ]);
    }

    /**
     * Create a new table.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'number' => 'required|string|max:255',
        ]);

        $table = Table::create([
            'restaurant_id' => $user->restaurant_id,
            'number' => $validated['number'],
            'status' => 'free',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mesa creada exitosamente.',
            'data' => $table
        ], 201);
    }

    /**
     * Update table details.
     */
    public function update(Request $request, Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'number' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:free,occupied,payment_pending',
        ]);

        $table->update(array_filter($validated));

        return response()->json([
            'status' => 'success',
            'message' => 'Mesa actualizada exitosamente.',
            'data' => $table
        ]);
    }

    /**
     * Delete a table.
     */
    public function destroy(Table $table)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $table->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mesa eliminada exitosamente.'
        ]);
    }

    /**
     * Toggle active/inactive for self-order.
     */
    public function toggleActivation(Request $request, Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $table->is_active_for_order = !$table->is_active_for_order;
        if ($table->is_active_for_order) {
            $table->getOrGenerateDynamicPin(true);
        } else {
            $table->clearTempPin();
        }
        $table->save();

        return response()->json([
            'status' => 'success',
            'message' => $table->is_active_for_order ? 'Mesa activada para autopedido.' : 'Mesa desactivada para autopedido.',
            'data' => $table
        ]);
    }
}
