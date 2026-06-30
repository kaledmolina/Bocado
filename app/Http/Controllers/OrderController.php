<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Public QR Code scanning endpoint.
     * Redirects waiter to order sheet, or shows public menu to client.
     */
    public function scanQR($qr_code_token)
    {
        $table = Table::where('qr_code_token', $qr_code_token)->firstOrFail();
        $user = Auth::user();

        // If waiter is logged in, redirect to waiter order taking page
        if ($user && $user->isWaiter()) {
            return redirect()->route('waiter.order', $table->id);
        }

        // Fetch restaurant details and products
        $restaurant = $table->restaurant;

        // Auto-generate PIN if table PIN security is enabled and table is active
        if ($restaurant->security_table_pin) {
            $table->getOrGenerateDynamicPin();
            $table->refresh();
        }

        $products = Product::where('restaurant_id', $table->restaurant_id)
            ->where('is_available', true)
            ->get()
            ->groupBy('category');

        // Fetch current active order items if occupied or pending payment (client can see their bill!)
        $activeOrder = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->with('items.product')
            ->first();

        return Inertia::render('Public/Menu', [
            'table' => $table,
            'restaurant' => $restaurant,
            'categories' => $products,
            'activeOrder' => $activeOrder,
            'isDemo' => request('demo') === 'true' || session('is_demo_user', false),
        ]);
    }

    /**
     * Show order sheet for waiter.
     */
    public function showOrderSheet(Table $table)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || $table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        // Fetch products and active order
        $products = Product::where('restaurant_id', $user->restaurant_id)
            ->where('is_available', true)
            ->get();

        $activeOrders = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->with('items.product')
            ->get();

        return Inertia::render('Waiter/OrderSheet', [
            'table' => $table,
            'products' => $products,
            'activeOrders' => $activeOrders,
            'restaurant' => $user->restaurant,
        ]);
    }

    /**
     * Save or update an order for a table (taken by waiter).
     */
    public function saveOrder(Request $request, Table $table)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || $table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:255',
            'request_id' => 'nullable|string', // If it's approving a specific request
        ]);

        DB::transaction(function () use ($request, $table, $user) {
            $order = Order::create([
                'table_id' => $table->id,
                'restaurant_id' => $user->restaurant_id,
                'waiter_id' => $user->id,
                'customer_name' => $request->customer_name,
                'status' => 'pending',
                'total_amount' => 0.00,
            ]);

            $total = 0.00;
            foreach ($request->items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $subtotal = $product->price * $itemData['quantity'];
                $total += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'price' => $product->price,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            $order->update([
                'total_amount' => $total,
            ]);

            // Set table status as occupied
            $table->update([
                'status' => 'occupied',
            ]);

            // Remove the specific request from cart_data if it exists
            if ($request->filled('request_id')) {
                $currentCart = is_array($table->cart_data) ? $table->cart_data : [];
                $currentCart = array_values(array_filter($currentCart, function ($req) use ($request) {
                    return isset($req['id']) && $req['id'] !== $request->request_id;
                }));
                
                $table->update(['cart_data' => count($currentCart) > 0 ? $currentCart : null]);
            }
        });

        return redirect()->back()->with('success', 'Pedido guardado exitosamente.');
    }

    /**
     * Request payment (change table status to payment_pending).
     */
    public function requestPayment(Table $table)
    {
        $user = Auth::user();
        if (!$user->isWaiter() || $table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $table->update([
            'status' => 'payment_pending',
        ]);

        return redirect()->route('waiter.dashboard')->with('success', 'Cuenta solicitada.');
    }

    /**
     * Mark order as paid and release table (can be done by waiter or admin).
     */
    public function markAsPaid(Table $table, Request $request)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        if ($user->isWaiter() && !$table->restaurant->waiters_can_collect_payment) {
            abort(403, 'Los meseros no tienen autorización para cobrar cuentas.');
        }

        $activeSession = \App\Models\CashSession::where('restaurant_id', $table->restaurant_id)
            ->whereNull('closed_at')
            ->exists();

        if (!$activeSession) {
            return redirect()->back()->with('error', '⚠️ No se puede procesar el pago: la caja registradora está cerrada. Por favor abre la caja antes de cobrar.');
        }

        $orderId = $request->input('order_id');
        
        $orders = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->when($orderId, function($query) use ($orderId) {
                return $query->where('id', $orderId);
            })
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->back()->with('error', 'No se encontraron pedidos pendientes para cobrar.');
        }
            
        $totalTableAmount = $orders->sum('total_amount');

        $receivedAmount = $request->input('received_amount');
        $changeAmount = $request->input('change_amount');

        if ($receivedAmount !== null && $orders->count() > 0) {
            if ($receivedAmount < $totalTableAmount) {
                return redirect()->back()->with('error', '⚠️ El monto entregado es menor que el total de la cuenta.');
            }
        }

        DB::transaction(function () use ($table, $orders, $receivedAmount, $changeAmount, $totalTableAmount) {
            if ($orders->count() > 0) {
                foreach ($orders as $idx => $order) {
                    $order->update([
                        'status' => 'paid',
                        'received_amount' => $idx === 0 ? $receivedAmount : null,
                        'change_amount' => $idx === 0 ? $changeAmount : null,
                    ]);
                }
            }

            $remainingPending = Order::where('table_id', $table->id)->where('status', 'pending')->count();
            
            if ($remainingPending === 0) {
                $table->update([
                    'status' => 'free',
                    'cart_data' => null,
                    'is_active_for_order' => true,
                ]);
                $table->generateTempPin();
            }

            \App\Models\TableLog::create([
                'restaurant_id' => $table->restaurant_id,
                'table_id' => $table->id,
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'action' => 'paid',
                'details' => [
                    'order_ids' => $orders->pluck('id'),
                    'total_amount' => $totalTableAmount,
                    'received_amount' => $receivedAmount,
                    'table_released' => $remainingPending === 0
                ]
            ]);
        });

        return redirect()->back()->with('success', 'Mesa cobrada y liberada con nuevo PIN.');
    }

    /**
     * Release table without payment (cancel pending order).
     */
    public function releaseTable(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        DB::transaction(function () use ($table) {
            $orders = Order::where('table_id', $table->id)
                ->where('status', 'pending')
                ->get();

            foreach ($orders as $order) {
                $order->update([
                    'status' => 'cancelled',
                ]);
            }

            $table->update([
                'status' => 'free',
                'cart_data' => null,
                'is_active_for_order' => true,
            ]);
            $table->generateTempPin();

            \App\Models\TableLog::create([
                'restaurant_id' => $table->restaurant_id,
                'table_id' => $table->id,
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'action' => 'released',
                'details' => [
                    'cancelled_order_ids' => $orders->pluck('id'),
                ]
            ]);
        });

        return redirect()->back()->with('success', 'Mesa liberada con nuevo PIN.');
    }

    /**
     * Show orders list for Admin.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $orders = Order::where('restaurant_id', $user->restaurant_id)
            ->with(['items.product', 'table', 'waiter'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch tables with active client cart requests
        $tablesWithCart = Table::where('restaurant_id', $user->restaurant_id)
            ->whereNotNull('cart_data')
            ->get();

        $virtualOrders = collect();
        foreach ($tablesWithCart as $table) {
            $cartData = $table->cart_data;
            if (empty($cartData)) {
                continue;
            }

            foreach ($cartData as $requestItem) {
                if (!isset($requestItem['id']) || !isset($requestItem['items'])) continue;

                $totalAmount = 0;
                $items = [];
                foreach ($requestItem['items'] as $idx => $item) {
                    $price = floatval($item['price'] ?? 0);
                    $qty = intval($item['quantity'] ?? 1);
                    $totalAmount += $price * $qty;

                    $items[] = [
                        'id' => -$idx - 1,
                        'quantity' => $qty,
                        'price' => $price,
                        'notes' => $item['notes'] ?? '',
                        'product' => [
                            'name' => $item['name'] ?? 'Producto'
                        ]
                    ];
                }

                $virtualOrders->push([
                    'id' => "cart-{$requestItem['id']}",
                    'table_id' => $table->id,
                    'waiter_id' => null,
                    'customer_name' => $requestItem['customer_name'] ?? 'Cliente',
                    'status' => 'pending_approval',
                    'total_amount' => $totalAmount,
                    'created_at' => $requestItem['created_at'] ?? $table->updated_at->toIso8601String(),
                    'table' => [
                        'number' => $table->number,
                        'qr_code_token' => $table->qr_code_token
                    ],
                    'waiter' => null,
                    'items' => $items
                ]);
            }
        }

        $allOrders = $virtualOrders->merge($orders);

        return Inertia::render('Admin/Orders', [
            'orders' => $allOrders
        ]);
    }

    /**
     * Request an order from the client (fills Table cart_data).
     */
    public function requestClientOrder(Request $request, $qr_code_token)
    {
        $table = Table::where('qr_code_token', $qr_code_token)->firstOrFail();
        $restaurant = $table->restaurant;

        // Check if table is active
        if (!$table->is_active_for_order) {
            return back()->withErrors(['security' => 'La mesa no está activa. Pídele al mesero que la active.']);
        }

        // Action A: Request PIN
        if ($request->input('action') === 'request_pin') {
            $table->update([
                'pin_requested' => true,
            ]);
            return back()->with('success', 'Solicitud de PIN enviada al mesero.');
        }

        // Action B: Submit Autopedido (actual order)
        if ($request->has('items')) {
            // Validate Table PIN if security is enabled (only applies to actual orders)
            if ($restaurant->security_table_pin) {
                $enteredPin = $request->input('pin');
                
                // Verify PIN exists and is not expired (5 minutes)
                if (empty($table->temp_pin) || empty($table->pin_updated_at) || now()->diffInMinutes($table->pin_updated_at) >= 5) {
                    // Regenerate a new one so waiter can see it and dictate it
                    $table->getOrGenerateDynamicPin(true);
                    return back()->withErrors(['security' => 'El PIN ha expirado o no es válido. Por favor, solicita el nuevo PIN al mesero.']);
                }

                if ($table->temp_pin !== $enteredPin) {
                    return back()->withErrors(['security' => 'El PIN ingresado es incorrecto.']);
                }
            }

            // Map items with database prices and names to prevent tampering
            $items = $request->input('items');
            if (empty($items) || !is_array($items)) {
                return back()->withErrors(['security' => 'El pedido está vacío.']);
            }

            $finalItems = [];
            foreach ($items as $item) {
                $product = Product::where('restaurant_id', $table->restaurant_id)
                    ->where('is_available', true)
                    ->find($item['product_id']);
                
                if ($product) {
                    $finalItems[] = [
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'price' => floatval($product->price),
                        'quantity' => max(1, intval($item['quantity'])),
                        'notes' => substr($item['notes'] ?? '', 0, 255),
                    ];
                }
            }

            if (empty($finalItems)) {
                return back()->withErrors(['security' => 'Ningún producto seleccionado es válido.']);
            }

            $currentCart = is_array($table->cart_data) ? $table->cart_data : [];
            // If the old format exists (array of items without 'id'), wrap it. We can just check if first item has 'product_id' directly at root.
            if (count($currentCart) > 0 && isset($currentCart[0]['product_id'])) {
                $currentCart = []; // Just clear old legacy carts to avoid issues
            }

            $customerName = $request->input('customer_name', 'Cliente');

            $currentCart[] = [
                'id' => uniqid('req_'),
                'customer_name' => $customerName,
                'items' => $finalItems,
                'created_at' => now()->toIso8601String()
            ];

            $table->update([
                'cart_data' => $currentCart,
                'status' => 'occupied',
                'pin_requested' => false,
            ]);

            // Consumir/Regenerar el PIN dinámico inmediatamente
            if ($restaurant->security_table_pin) {
                $table->getOrGenerateDynamicPin(true);
            }

            return back()->with('success', 'Pedido enviado. Esperando aprobación del mesero.');
        }

        // Action C: Default call waiter (No PIN required)
        $currentCart = is_array($table->cart_data) ? $table->cart_data : [];
        if (count($currentCart) > 0 && isset($currentCart[0]['product_id'])) {
            $currentCart = []; 
        }

        $customerName = $request->input('customer_name', 'Mesa');

        $currentCart[] = [
            'id' => uniqid('req_'),
            'customer_name' => $customerName,
            'items' => [
                [
                    'product_id' => 0,
                    'name' => 'Llamado al mesero 🛎️',
                    'price' => 0.00,
                    'quantity' => 1,
                    'notes' => 'El cliente solicita atención en la mesa.'
                ]
            ],
            'created_at' => now()->toIso8601String()
        ];

        $table->update([
            'cart_data' => $currentCart,
            'status' => 'occupied',
            'pin_requested' => false,
        ]);

        return back()->with('success', 'Mesero solicitado correctamente. Te atenderá en breve.');
    }

    /**
     * Clear client cart from table.
     */
    public function clearClientCart(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $table->update([
            'cart_data' => null,
            'pin_requested' => false,
        ]);

        return back()->with('success', 'Pedido solicitado del cliente cancelado/limpiado.');
    }

    /**
     * Toggle waiter activation status for a table and handle PIN generation.
     */
    public function toggleActivation(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            abort(403);
        }

        $table->is_active_for_order = !$table->is_active_for_order;

        if ($table->is_active_for_order) {
            $restaurant = $table->restaurant;
            if ($restaurant->security_table_pin && empty($table->temp_pin)) {
                $table->generateTempPin();
            }
        } else {
            $table->temp_pin = null;
        }

        $table->save();

        \App\Models\TableLog::create([
            'restaurant_id' => $table->restaurant_id,
            'table_id' => $table->id,
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
            'action' => $table->is_active_for_order ? 'activated' : 'deactivated',
            'details' => []
        ]);

        return back()->with('success', $table->is_active_for_order ? 'Mesa activada para autopedidos.' : 'Mesa desactivada.');
    }
}
