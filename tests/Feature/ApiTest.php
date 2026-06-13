<?php

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Table;
use App\Models\Product;
use App\Models\Order;
use App\Models\CashSession;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('API user registration and login endpoints work', function () {
    // 1. Test Register
    $registerResponse = $this->postJson('/api/auth/register', [
        'name' => 'API Waiter',
        'email' => 'apiwaiter@bocado.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'waiter',
        'phone' => '12345678',
        'city' => 'Bogota',
    ]);

    $registerResponse->assertStatus(210);
    $registerResponse->assertJsonStructure([
        'status',
        'message',
        'data' => [
            'token',
            'user'
        ]
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'apiwaiter@bocado.com',
        'role' => 'waiter'
    ]);

    // 2. Test Login
    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => 'apiwaiter@bocado.com',
        'password' => 'password123'
    ]);

    $loginResponse->assertStatus(200);
    $loginResponse->assertJsonStructure([
        'status',
        'message',
        'data' => [
            'token',
            'user'
        ]
    ]);

    $token = $loginResponse->json('data.token');

    // 3. Test Me (Authenticated)
    $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->getJson('/api/auth/me');

    $meResponse->assertStatus(200);
    $meResponse->assertJsonPath('data.email', 'apiwaiter@bocado.com');
});

test('API QR code scan and client order workflow', function () {
    $restaurant = Restaurant::create(['name' => 'Bocado Fast Food', 'security_table_pin' => true]);
    $table = Table::create([
        'restaurant_id' => $restaurant->id,
        'number' => 'Mesa 5',
        'is_active_for_order' => true,
    ]);

    $product = Product::create([
        'restaurant_id' => $restaurant->id,
        'name' => 'Hamburger Super',
        'price' => 18000, // Colombian Pesos format
        'category' => 'Hamburgers',
        'is_available' => true
    ]);

    // Scan table
    $scanResponse = $this->getJson("/api/tables/{$table->qr_code_token}");
    $scanResponse->assertStatus(200);
    
    $table->refresh();
    $pin = $table->temp_pin;
    expect($pin)->not->toBeNull();

    // Client places order with wrong PIN
    $orderWrongPin = $this->postJson("/api/tables/{$table->qr_code_token}/order", [
        'pin' => '0000',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2, 'notes' => 'Sin cebolla']
        ]
    ]);
    $orderWrongPin->assertStatus(400);

    // Client places order with correct PIN
    $orderCorrect = $this->postJson("/api/tables/{$table->qr_code_token}/order", [
        'pin' => $pin,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2, 'notes' => 'Sin cebolla']
        ]
    ]);
    $orderCorrect->assertStatus(200);

    $table->refresh();
    expect($table->cart_data)->not->toBeNull();
    expect($table->cart_data[0]['name'])->toBe('Hamburger Super');
    expect($table->status)->toBe('occupied');
});

test('API Waiter dashboard & order placement operations', function () {
    $restaurant = Restaurant::create(['name' => 'Gourmet Grill', 'waiters_can_collect_payment' => true]);
    $waiter = User::create([
        'name' => 'Lina Waiter',
        'email' => 'lina@gourmet.com',
        'password' => bcrypt('password123'),
        'role' => 'waiter',
        'restaurant_id' => $restaurant->id,
    ]);

    $table = Table::create([
        'restaurant_id' => $restaurant->id,
        'number' => 'Mesa 12',
    ]);

    $product = Product::create([
        'restaurant_id' => $restaurant->id,
        'name' => 'Steak Baby Beef',
        'price' => 35000,
        'category' => 'Meats',
        'is_available' => true
    ]);

    $token = $waiter->createToken('waiter-token')->plainTextToken;

    // Start shift
    $shiftStart = $this->actingAs($waiter, 'sanctum')
        ->postJson('/api/waiter/shifts/start');
    $shiftStart->assertStatus(200);

    // Place Order as waiter
    $orderSave = $this->actingAs($waiter, 'sanctum')
        ->postJson("/api/tables/{$table->id}/waiter-order", [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1]
            ]
        ]);
    $orderSave->assertStatus(200);

    // Verify order in database
    $order = Order::where('table_id', $table->id)->where('status', 'pending')->first();
    expect($order)->not->toBeNull();
    expect($order->total_amount)->toBe(35000.00);

    // Open cash session (must be Admin/Owner)
    $owner = User::create([
        'name' => 'Owner Chef',
        'email' => 'owner@gourmet.com',
        'password' => bcrypt('password123'),
        'role' => 'admin',
        'restaurant_id' => $restaurant->id,
    ]);

    // Open register
    $openCash = $this->actingAs($owner, 'sanctum')
        ->postJson('/api/cash/open', ['opening_balance' => 100000]);
    $openCash->assertStatus(200);

    // Pay order as waiter (waiter_can_collect_payment is true)
    $payOrder = $this->actingAs($waiter, 'sanctum')
        ->postJson("/api/tables/{$table->id}/pay", [
            'received_amount' => 40000,
            'change_amount' => 5000
        ]);
    $payOrder->assertStatus(200);

    $order->refresh();
    expect($order->status)->toBe('paid');

    // Close register
    $closeCash = $this->actingAs($owner, 'sanctum')
        ->postJson('/api/cash/close', ['real_amount' => 135000]);
    $closeCash->assertStatus(200);

    // End shift
    $shiftEnd = $this->actingAs($waiter, 'sanctum')
        ->postJson('/api/waiter/shifts/end');
    $shiftEnd->assertStatus(200);
});
