<?php

namespace App\Http\Controllers;

use App\Models\CashSession;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CashSessionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->isWaiter()) {
            abort(403);
        }

        $restaurantId = $user->restaurant_id;

        // Fetch active session
        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        // Fetch past closed sessions
        $reconciliations = CashSession::where('restaurant_id', $restaurantId)
            ->whereNotNull('closed_at')
            ->with('user')
            ->orderBy('closed_at', 'desc')
            ->get();

        // Calculate total database paid sales
        $totalPaidAmount = Order::where('restaurant_id', $restaurantId)
            ->where('status', 'paid')
            ->sum('total_amount');

        return Inertia::render('Admin/Cash', [
            'activeSession' => $activeSession,
            'reconciliations' => $reconciliations,
            'totalPaidAmount' => (float)$totalPaidAmount
        ]);
    }

    public function open(Request $request)
    {
        $user = Auth::user();
        if ($user->isWaiter()) {
            abort(403);
        }

        $restaurantId = $user->restaurant_id;

        $request->validate([
            'opening_balance' => 'required|numeric|min:0',
        ]);

        // Check if there is an active session
        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        if ($activeSession) {
            return redirect()->back()->with('error', 'Ya existe una caja abierta para este restaurante.');
        }

        // Get paid sales reference
        $totalPaidAmount = Order::where('restaurant_id', $restaurantId)
            ->where('status', 'paid')
            ->sum('total_amount');

        CashSession::create([
            'restaurant_id' => $restaurantId,
            'user_id' => $user->id,
            'opened_at' => now(),
            'opening_balance' => $request->opening_balance,
            'opening_paid_amount_reference' => (float)$totalPaidAmount
        ]);

        return redirect()->back()->with('success', 'Caja registradora abierta exitosamente.');
    }

    public function close(Request $request)
    {
        $user = Auth::user();
        if ($user->isWaiter()) {
            abort(403);
        }

        $restaurantId = $user->restaurant_id;

        $request->validate([
            'real_amount' => 'required|numeric|min:0',
        ]);

        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        if (!$activeSession) {
            return redirect()->back()->with('error', 'No hay ninguna caja abierta activa.');
        }

        // Get paid sales total currently
        $totalPaidAmount = Order::where('restaurant_id', $restaurantId)
            ->where('status', 'paid')
            ->sum('total_amount');

        $salesInShift = max(0.00, (float)$totalPaidAmount - $activeSession->opening_paid_amount_reference);
        $expectedAmount = $activeSession->opening_balance + $salesInShift;
        $realAmount = (float)$request->real_amount;
        $difference = $realAmount - $expectedAmount;

        $activeSession->update([
            'closed_at' => now(),
            'expected_amount' => $expectedAmount,
            'real_amount' => $realAmount,
            'difference' => $difference
        ]);

        return redirect()->back()->with('success', 'Caja cerrada y arqueo registrado correctamente.');
    }
}
