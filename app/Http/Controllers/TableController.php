<?php

namespace App\Http\Controllers;

use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TableController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $tables = Table::where('restaurant_id', $user->restaurant_id)->get();

        return Inertia::render('Admin/Tables', [
            'tables' => $tables
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'number' => 'required|string|max:255',
        ]);

        Table::create([
            'restaurant_id' => $user->restaurant_id,
            'number' => $validated['number'],
            'status' => 'free',
        ]);

        return redirect()->back()->with('success', 'Mesa creada exitosamente.');
    }

    public function update(Request $request, Table $table)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'number' => 'required|string|max:255',
            'status' => 'required|string|in:free,occupied,payment_pending',
        ]);

        $table->update($validated);

        return redirect()->back()->with('success', 'Mesa actualizada exitosamente.');
    }

    public function destroy(Table $table)
    {
        $user = Auth::user();
        if (!$user->isAdmin() || $table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $table->delete();

        return redirect()->back()->with('success', 'Mesa eliminada exitosamente.');
    }
}
