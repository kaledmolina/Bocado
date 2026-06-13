<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashSession;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiCashController extends Controller
{
    /**
     * Get cash session status.
     */
    public function status()
    {
        $user = Auth::user();
        if ($user->role === 'waiter') {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $restaurantId = $user->restaurant_id;

        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        // Calculate total database paid sales
        $totalPaidAmount = Order::where('restaurant_id', $restaurantId)
            ->where('status', 'paid')
            ->sum('total_amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_session' => $activeSession,
                'total_paid_amount' => (float)$totalPaidAmount
            ]
        ]);
    }

    /**
     * Open cash session.
     */
    public function open(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'waiter') {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $restaurantId = $user->restaurant_id;

        $request->validate([
            'opening_balance' => 'required|numeric|min:0',
        ]);

        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        if ($activeSession) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ya existe una caja abierta para este restaurante.'
            ], 400);
        }

        $totalPaidAmount = Order::where('restaurant_id', $restaurantId)
            ->where('status', 'paid')
            ->sum('total_amount');

        $session = CashSession::create([
            'restaurant_id' => $restaurantId,
            'user_id' => $user->id,
            'opened_at' => now(),
            'opening_balance' => $request->opening_balance,
            'opening_paid_amount_reference' => (float)$totalPaidAmount
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Caja registradora abierta exitosamente.',
            'data' => $session
        ]);
    }

    /**
     * Close cash session.
     */
    public function close(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'waiter') {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $restaurantId = $user->restaurant_id;

        $request->validate([
            'real_amount' => 'required|numeric|min:0',
        ]);

        $activeSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        if (!$activeSession) {
            return response()->json([
                'status' => 'error',
                'message' => 'No hay ninguna caja abierta activa.'
            ], 400);
        }

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

        return response()->json([
            'status' => 'success',
            'message' => 'Caja cerrada y arqueo registrado correctamente.',
            'data' => $activeSession
        ]);
    }
}
