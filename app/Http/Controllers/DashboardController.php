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
use Illuminate\Support\Facades\Hash;
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

    public function deleteRestaurant(Restaurant $restaurant)
    {
        if ($restaurant->is_demo) {
            return redirect()->back()->with('error', 'No puedes eliminar el restaurante demo de la plataforma.');
        }

        $restaurant->delete();

        return redirect()->back()->with('success', 'El restaurante y todos sus datos asociados fueron eliminados correctamente.');
    }

    public function deleteUser(User $user)
    {
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta de SuperAdmin.');
        }

        if (in_array($user->email, ['owner@rinconcito.com', 'pedro@rinconcito.com', 'maria@rinconcito.com'])) {
            return redirect()->back()->with('error', 'No puedes eliminar los usuarios demo esenciales del sistema.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'El usuario fue eliminado correctamente.');
    }

    public function resetDemoRestaurant(Restaurant $restaurant)
    {
        if (!$restaurant->is_demo) {
            return redirect()->back()->with('error', 'El restaurante no es de demostración.');
        }

        // Reset restaurant details
        $restaurant->update([
            'name' => 'El Rinconcito Italiano',
            'address' => 'Av. Central 456, Zona G',
            'phone' => '+54 11 2233-4455',
            'security_waiter_activation' => false,
            'security_table_pin' => true,
            'security_require_physical_scan' => false,
            'primary_color' => '#f97316',
            'secondary_color' => '#1e293b',
            'welcome_subtitle' => '¡Pide desde tu mesa de forma rápida!',
        ]);

        // Delete orders
        $orderIds = Order::where('restaurant_id', $restaurant->id)->pluck('id');
        DB::table('order_items')->whereIn('order_id', $orderIds)->delete();
        Order::where('restaurant_id', $restaurant->id)->delete();

        // Delete shifts, cash sessions, applications and ratings
        DB::table('shifts')->where('restaurant_id', $restaurant->id)->delete();
        DB::table('cash_sessions')->where('restaurant_id', $restaurant->id)->delete();
        DB::table('restaurant_applications')->where('restaurant_id', $restaurant->id)->delete();
        DB::table('waiter_ratings')->where('restaurant_id', $restaurant->id)->delete();

        // Delete new users created during testing (keeping only Owner, Pedro and Maria)
        User::where('restaurant_id', $restaurant->id)
            ->whereNotIn('email', ['owner@rinconcito.com', 'pedro@rinconcito.com', 'maria@rinconcito.com'])
            ->delete();

        // Reset essential users to default state
        User::where('email', 'owner@rinconcito.com')->update([
            'name' => 'Propietario Rinconcito',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
        User::where('email', 'pedro@rinconcito.com')->update([
            'name' => 'Pedro Mesero',
            'password' => Hash::make('password'),
            'role' => 'waiter',
            'is_active' => true,
        ]);
        User::where('email', 'maria@rinconcito.com')->update([
            'name' => 'Maria Mesera',
            'password' => Hash::make('password'),
            'role' => 'waiter',
            'is_active' => true,
        ]);

        // Delete new products created during testing
        Product::where('restaurant_id', $restaurant->id)
            ->whereNotIn('name', [
                'Pizza Margarita',
                'Lasagna Boloñesa',
                'Bruschetta de Tomate',
                'Coca Cola',
                'Limonada Natural',
                'Tiramisú Clásico'
            ])
            ->delete();

        // Reset default products
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Pizza Margarita')->update([
            'description' => 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.',
            'price' => 15.00,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Lasagna Boloñesa')->update([
            'description' => 'Capas de pasta rellenas de carne boloñesa, bechamel y queso gratinado.',
            'price' => 18.50,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Bruschetta de Tomate')->update([
            'description' => 'Pan tostado con ajo, tomates picados, albahaca y aceite de oliva virgen.',
            'price' => 8.00,
            'category' => 'Entradas',
            'is_available' => true,
        ]);
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Coca Cola')->update([
            'description' => 'Refresco de cola de 350ml en botella de vidrio.',
            'price' => 3.00,
            'category' => 'Bebidas',
            'is_available' => true,
        ]);
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Limonada Natural')->update([
            'description' => 'Limonada refrescante endulzada y con menta fresca.',
            'price' => 3.50,
            'category' => 'Bebidas',
            'is_available' => true,
        ]);
        Product::where('restaurant_id', $restaurant->id)->where('name', 'Tiramisú Clásico')->update([
            'description' => 'Postre italiano con bizcochos soletilla café, mascarpone y cacao.',
            'price' => 6.50,
            'category' => 'Postres',
            'is_available' => true,
        ]);

        // Delete new tables created during testing
        Table::where('restaurant_id', $restaurant->id)
            ->whereNotIn('number', ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4'])
            ->delete();

        // Reset the default tables to their original state
        foreach ($restaurant->tables()->get() as $table) {
            $table->update([
                'status' => 'free',
                'cart_data' => null,
                'temp_pin' => null,
                'pin_updated_at' => null,
                'pin_requested' => false,
                'is_active_for_order' => true,
            ]);
        }

        // Recreate the seed orders for a beautiful initial experience:
        $pedro = User::where('email', 'pedro@rinconcito.com')->first();
        $maria = User::where('email', 'maria@rinconcito.com')->first();
        $pizza = Product::where('restaurant_id', $restaurant->id)->where('name', 'Pizza Margarita')->first();
        $coca = Product::where('restaurant_id', $restaurant->id)->where('name', 'Coca Cola')->first();
        $lasagna = Product::where('restaurant_id', $restaurant->id)->where('name', 'Lasagna Boloñesa')->first();
        $limon = Product::where('restaurant_id', $restaurant->id)->where('name', 'Limonada Natural')->first();

        // Mesa 2 occupied
        $t2 = Table::where('restaurant_id', $restaurant->id)->where('number', 'Mesa 2')->first();
        if ($t2) {
            $t2->update(['status' => 'occupied']);
            if ($pedro && $pizza && $coca) {
                $o2 = Order::create([
                    'restaurant_id' => $restaurant->id,
                    'table_id' => $t2->id,
                    'waiter_id' => $pedro->id,
                    'status' => 'pending',
                    'total_amount' => 18.00,
                ]);
                DB::table('order_items')->insert([
                    [
                        'order_id' => $o2->id,
                        'product_id' => $pizza->id,
                        'quantity' => 1,
                        'price' => 15.00,
                        'notes' => 'Bien tostada',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'order_id' => $o2->id,
                        'product_id' => $coca->id,
                        'quantity' => 1,
                        'price' => 3.00,
                        'notes' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
            }
        }

        // Mesa 3 payment_pending
        $t3 = Table::where('restaurant_id', $restaurant->id)->where('number', 'Mesa 3')->first();
        if ($t3) {
            $t3->update(['status' => 'payment_pending']);
            if ($maria && $lasagna && $limon) {
                $o3 = Order::create([
                    'restaurant_id' => $restaurant->id,
                    'table_id' => $t3->id,
                    'waiter_id' => $maria->id,
                    'status' => 'pending',
                    'total_amount' => 44.00,
                ]);
                DB::table('order_items')->insert([
                    [
                        'order_id' => $o3->id,
                        'product_id' => $lasagna->id,
                        'quantity' => 2,
                        'price' => 18.50,
                        'notes' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'order_id' => $o3->id,
                        'product_id' => $limon->id,
                        'quantity' => 2,
                        'price' => 3.50,
                        'notes' => 'Con poco hielo',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
            }
        }

        return redirect()->back()->with('success', 'El estado del restaurante demo ha sido restablecido a su estado inicial (meseros, productos y mesas por defecto).');
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
