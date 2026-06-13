<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Table;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\Product;
use App\Models\CashSession;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            $restaurants = Restaurant::withCount([
                'products',
                'tables',
                'orders as sales_count' => function ($query) {
                    $query->where('status', 'paid');
                },
                'users as waiters_count' => function ($query) {
                    $query->where('role', 'waiter');
                }
            ])->withSum([
                'orders as total_sales' => function ($query) {
                    $query->where('status', 'paid');
                }
            ], 'total_amount')->get();

            $users = User::with('restaurant')
                ->where('id', '!=', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $totalUsers = User::count();
            $totalProducts = Product::count();
            $totalTables = Table::count();

            return Inertia::render('SuperAdmin/Dashboard', [
                'restaurants' => $restaurants,
                'users' => $users,
                'totalUsers' => $totalUsers,
                'totalProducts' => $totalProducts,
                'totalTables' => $totalTables,
            ]);
        }

        if ($user->isWaiter()) {
            return redirect()->route('waiter.dashboard');
        }

        // Admin Analytics
        $restaurantId = $user->restaurant_id;

        // Sales by Waiter
        $salesByWaiter = Order::where('orders.restaurant_id', $restaurantId)
            ->where('orders.status', 'paid')
            ->join('users', 'orders.waiter_id', '=', 'users.id')
            ->groupBy('orders.waiter_id', 'users.name')
            ->select('users.name as waiter_name', DB::raw('SUM(orders.total_amount) as total_sales'), DB::raw('COUNT(orders.id) as orders_count'))
            ->get();

        // Sales by Table
        $salesByTable = Order::where('orders.restaurant_id', $restaurantId)
            ->where('orders.status', 'paid')
            ->join('tables', 'orders.table_id', '=', 'tables.id')
            ->groupBy('orders.table_id', 'tables.number')
            ->select('tables.number as table_number', DB::raw('SUM(orders.total_amount) as total_sales'))
            ->get();

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

        return Inertia::render('Admin/Dashboard', [
            'restaurant' => $user->restaurant,
            'salesByWaiter' => $salesByWaiter,
            'salesByTable' => $salesByTable,
            'tablesStatus' => $tablesStatus,
            'ordersSummary' => $ordersSummary,
            'pendingTables' => $pendingTables,
            'activeCashSession' => $activeCashSession
        ]);
    }

    public function toggleRestaurantStatus(Restaurant $restaurant)
    {
        $restaurant->is_active = !$restaurant->is_active;
        $restaurant->save();

        return redirect()->back()->with('success', 'Estado del restaurante actualizado.');
    }

    public function toggleUserStatus(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes desactivar tu propia cuenta.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return redirect()->back()->with('success', 'Estado del usuario actualizado.');
    }

    public function showSettings()
    {
        $user = Auth::user();
        if ($user->isWaiter()) {
            abort(403);
        }

        return Inertia::render('Admin/Settings', [
            'restaurant' => $user->restaurant,
        ]);
    }

    public function updateSecuritySettings(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        if ($user->isWaiter()) {
            abort(403);
        }

        $request->validate([
            'security_waiter_activation' => 'nullable|boolean',
            'security_table_pin' => 'nullable|boolean',
            'security_require_physical_scan' => 'nullable|boolean',
            'waiters_can_collect_payment' => 'required|boolean',
            'client_can_call_waiter' => 'required|boolean',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'welcome_subtitle' => 'nullable|string|max:255',
        ]);

        $restaurant = $user->restaurant;
        $restaurant->update([
            'security_waiter_activation' => $request->input('security_waiter_activation', false),
            'security_table_pin' => $request->input('security_table_pin', false),
            'security_require_physical_scan' => $request->input('security_require_physical_scan', false),
            'waiters_can_collect_payment' => $request->waiters_can_collect_payment,
            'client_can_call_waiter' => $request->client_can_call_waiter,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
            'primary_color' => $request->input('primary_color', '#f97316'),
            'secondary_color' => $request->input('secondary_color', '#1e293b'),
            'welcome_subtitle' => $request->input('welcome_subtitle', '¡Pide desde tu mesa de forma rápida!'),
        ]);

        return redirect()->back()->with('success', 'Configuración del restaurante actualizada.');
    }

    public function toggleViewMode()
    {
        $user = Auth::user();
        // Allow switching view mode only if the actual role is admin
        $actualRole = $user->getRawOriginal('role') ?? $user->role;
        if ($actualRole !== 'admin') {
            abort(403);
        }

        $currentMode = session('view_mode', 'admin');
        $newMode = $currentMode === 'admin' ? 'waiter' : 'admin';
        session(['view_mode' => $newMode]);

        return redirect()->route('dashboard');
    }
}
