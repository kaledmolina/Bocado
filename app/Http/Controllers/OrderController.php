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

        $activeOrder = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->with('items.product')
            ->first();

        return Inertia::render('Waiter/OrderSheet', [
            'table' => $table,
            'products' => $products,
            'activeOrder' => $activeOrder,
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
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $table, $user) {
            // Find or create active order
            $order = Order::firstOrCreate(
                [
                    'table_id' => $table->id,
                    'status' => 'pending',
                ],
                [
                    'restaurant_id' => $user->restaurant_id,
                    'waiter_id' => $user->id,
                    'total_amount' => 0.00,
                ]
            );

            // Delete old items and add new ones
            $order->items()->delete();

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
        });

        return redirect()->route('waiter.dashboard')->with('success', 'Pedido guardado exitosamente.');
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

        // Check if there is an active cash session
        $activeSession = \App\Models\CashSession::where('restaurant_id', $table->restaurant_id)
            ->whereNull('closed_at')
            ->exists();

        if (!$activeSession) {
            return redirect()->back()->with('error', '⚠️ No se puede procesar el pago: la caja registradora está cerrada. Por favor abre la caja antes de cobrar.');
        }

        $order = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->first();

        $receivedAmount = $request->input('received_amount');
        $changeAmount = $request->input('change_amount');

        if ($receivedAmount !== null && $order) {
            if ($receivedAmount < $order->total_amount) {
                return redirect()->back()->with('error', '⚠️ El monto entregado es menor que el total de la cuenta.');
            }
        }

        DB::transaction(function () use ($table, $order, $receivedAmount, $changeAmount) {
            if ($order) {
                $order->update([
                    'status' => 'paid',
                    'received_amount' => $receivedAmount,
                    'change_amount' => $changeAmount,
                ]);
            }

            $table->update([
                'status' => 'free',
                'cart_data' => null,
                'is_active_for_order' => true,
            ]);
            $table->generateTempPin();
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
            $order = Order::where('table_id', $table->id)
                ->where('status', 'pending')
                ->first();

            if ($order) {
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

            $totalAmount = 0;
            $items = [];
            foreach ($cartData as $idx => $cartItem) {
                $price = floatval($cartItem['price'] ?? 0);
                $qty = intval($cartItem['quantity'] ?? 1);
                $totalAmount += $price * $qty;

                $items[] = [
                    'id' => -$idx - 1, // virtual id
                    'quantity' => $qty,
                    'price' => $price,
                    'notes' => $cartItem['notes'] ?? '',
                    'product' => [
                        'name' => $cartItem['name'] ?? 'Producto'
                    ]
                ];
            }

            $virtualOrders->push([
                'id' => "cart-{$table->id}",
                'table_id' => $table->id,
                'waiter_id' => null,
                'status' => 'pending_approval',
                'total_amount' => $totalAmount,
                'created_at' => $table->updated_at->toIso8601String(),
                'table' => [
                    'number' => $table->number,
                    'qr_code_token' => $table->qr_code_token
                ],
                'waiter' => null,
                'items' => $items
            ]);
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

        // Validate Table PIN if security is enabled (applies to both Action B and Action C)
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

        // Action B: Submit Autopedido (actual order)
        if ($request->has('items')) {
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

            $table->update([
                'cart_data' => $finalItems,
                'status' => 'occupied',
                'pin_requested' => false,
            ]);

            // Consumir/Regenerar el PIN dinámico inmediatamente
            if ($restaurant->security_table_pin) {
                $table->getOrGenerateDynamicPin(true);
            }

            return back()->with('success', 'Pedido enviado. Esperando aprobación del mesero.');
        }

        // Action C: Default call waiter
        $table->update([
            'cart_data' => [
                [
                    'product_id' => 0,
                    'name' => 'Llamado al mesero 🛎️',
                    'price' => 0.00,
                    'quantity' => 1,
                    'notes' => 'El cliente solicita atención en la mesa.'
                ]
            ],
            'status' => 'occupied',
            'pin_requested' => false,
        ]);

        // Consumir/Regenerar el PIN dinámico inmediatamente
        if ($restaurant->security_table_pin) {
            $table->getOrGenerateDynamicPin(true);
        }

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

        return back()->with('success', $table->is_active_for_order ? 'Mesa activada para autopedidos.' : 'Mesa desactivada.');
    }
}
