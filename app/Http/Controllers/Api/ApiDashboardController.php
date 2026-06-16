<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use App\Models\CashSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApiDashboardController extends Controller
{
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

        // Table status summary
        $tablesStatus = Table::where('restaurant_id', $restaurantId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $tablesStatus = array_merge([
            'free' => 0,
            'occupied' => 0,
            'payment_pending' => 0
        ], $tablesStatus);

        // Orders summary (paid vs pending)
        $ordersSummary = Order::where('restaurant_id', $restaurantId)
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->toArray();

        // Pending/Active Tables Details
        $pendingTables = Table::where('restaurant_id', $restaurantId)
            ->where(function ($query) {
                $query->where('status', '!=', 'free')
                      ->orWhere('pin_requested', true)
                      ->orWhereNotNull('cart_data');
            })
            ->with(['activeOrder.waiter', 'activeOrder.items.product'])
            ->get();

        // Active Cash Session
        $activeCashSession = CashSession::where('restaurant_id', $restaurantId)
            ->whereNull('closed_at')
            ->first();

        // Calculate totals
        $totalPaidCount = $ordersSummary['paid']['count'] ?? 0;
        $totalPaidAmount = (float)($ordersSummary['paid']['total'] ?? 0);
        $totalPendingCount = $ordersSummary['pending']['count'] ?? 0;
        $totalPendingAmount = (float)($ordersSummary['pending']['total'] ?? 0);
        
        $totalTables = array_sum($tablesStatus);
        $occupiedTablesCount = $tablesStatus['occupied'] + $tablesStatus['payment_pending'];

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'totalSalesCount' => $totalPaidCount,
                    'totalIncome' => $totalPaidAmount,
                    'averageTicket' => $totalPaidCount > 0 ? $totalPaidAmount / $totalPaidCount : 0,
                    'totalPendingAmount' => $totalPendingAmount,
                    'totalPendingCount' => $totalPendingCount,
                    'tablesFree' => $tablesStatus['free'],
                    'tablesOccupied' => $occupiedTablesCount,
                    'tablesTotal' => $totalTables,
                ],
                'pendingTables' => $pendingTables,
                'isCashSessionOpen' => $activeCashSession ? true : false,
            ]
        ]);
    }
}
