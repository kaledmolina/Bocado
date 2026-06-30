<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Table;
use App\Models\CashSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApiOrderController extends Controller
{
    /**
     * Get list of active orders (and virtual orders from client carts).
     */
    public function activeOrders()
    {
        $user = Auth::user();
        if (!$user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No perteneces a ningún restaurante'], 404);
        }

        // Real orders
        $orders = Order::where('restaurant_id', $user->restaurant_id)
            ->whereIn('status', ['pending', 'payment_pending'])
            ->with(['items.product', 'table', 'waiter'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Virtual orders from client carts
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
                    'id' => -$idx - 1, // Virtual ID
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

        return response()->json([
            'status' => 'success',
            'data' => $virtualOrders->merge($orders)
        ]);
    }

    /**
     * Client self-order placement via QR scan.
     */
    public function requestClientOrder(Request $request, $qr_code_token)
    {
        $table = Table::where('qr_code_token', $qr_code_token)->firstOrFail();
        $restaurant = $table->restaurant;

        if (!$table->is_active_for_order) {
            return response()->json([
                'status' => 'error',
                'message' => 'La mesa no está activa para pedidos.'
            ], 400);
        }

        // Handle items
        $items = $request->input('items');
        if (empty($items) || !is_array($items)) {
            // Default: Call Waiter (No PIN required)
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

            return response()->json([
                'status' => 'success',
                'message' => 'Mesero solicitado correctamente.'
            ]);
        }

        // Validate PIN if security is active (only applies to actual orders)
        if ($restaurant->security_table_pin) {
            $enteredPin = $request->input('pin');
            if (empty($table->temp_pin) || empty($table->pin_updated_at) || now()->diffInMinutes($table->pin_updated_at) >= 5) {
                $table->getOrGenerateDynamicPin(true);
                return response()->json([
                    'status' => 'error',
                    'message' => 'El PIN ha expirado o no es válido. Solicita el nuevo PIN al mesero.'
                ], 400);
            }

            if ($table->temp_pin !== $enteredPin) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El PIN ingresado es incorrecto.'
                ], 400);
            }
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
            return response()->json([
                'status' => 'error',
                'message' => 'Ningún producto seleccionado es válido.'
            ], 400);
        }

        $table->update([
            'cart_data' => $finalItems,
            'status' => 'occupied',
            'pin_requested' => false,
        ]);

        if ($restaurant->security_table_pin) {
            $table->getOrGenerateDynamicPin(true);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pedido enviado. Esperando aprobación del mesero.',
            'data' => $finalItems
        ]);
    }

    /**
     * Save order details by a waiter.
     */
    public function saveOrder(Request $request, Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $table, $user) {
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

            $table->update([
                'status' => 'occupied',
                'cart_data' => null // Clear virtual cart request since it is now registered
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Pedido guardado exitosamente.'
        ]);
    }

    /**
     * Request payment for a table.
     */
    public function requestPayment(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $table->update([
            'status' => 'payment_pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Cuenta solicitada correctamente.'
        ]);
    }

    /**
     * Collect payment and release the table.
     */
    public function markAsPaid(Table $table, Request $request)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        if ($user->role === 'waiter' && !$table->restaurant->waiters_can_collect_payment) {
            return response()->json(['status' => 'error', 'message' => 'Los meseros no tienen autorización para cobrar cuentas.'], 403);
        }

        $activeSession = CashSession::where('restaurant_id', $table->restaurant_id)
            ->whereNull('closed_at')
            ->exists();

        if (!$activeSession) {
            return response()->json(['status' => 'error', 'message' => 'La caja registradora está cerrada. Abre la caja antes de cobrar.'], 400);
        }

        $order = Order::where('table_id', $table->id)
            ->where('status', 'pending')
            ->first();

        $receivedAmount = $request->input('received_amount');
        $changeAmount = $request->input('change_amount');

        if ($receivedAmount !== null && $order && $receivedAmount < $order->total_amount) {
            return response()->json(['status' => 'error', 'message' => 'El monto entregado es menor que el total de la cuenta.'], 400);
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

        return response()->json([
            'status' => 'success',
            'message' => 'Mesa cobrada y liberada con éxito.'
        ]);
    }

    /**
     * Release table without payment (cancel active order).
     */
    public function releaseTable(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
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

        return response()->json([
            'status' => 'success',
            'message' => 'Mesa liberada con éxito sin cobro.'
        ]);
    }

    /**
     * Clear client cart.
     */
    public function clearClientCart(Table $table)
    {
        $user = Auth::user();
        if ($table->restaurant_id !== $user->restaurant_id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $table->update([
            'cart_data' => null,
            'pin_requested' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pedido solicitado del cliente cancelado.'
        ]);
    }
}
