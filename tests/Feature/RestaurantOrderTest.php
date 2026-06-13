<?php

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Table;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('new user registration creates a restaurant and assigns admin role', function () {
    $response = $this->post('/register', [
        'name' => 'John Admin',
        'email' => 'admin@pidelo.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'restaurant_name' => 'Pizza Palace',
    ]);

    $response->assertRedirect('/dashboard');

    $this->assertDatabaseHas('restaurants', [
        'name' => 'Pizza Palace',
    ]);

    $restaurant = Restaurant::where('name', 'Pizza Palace')->first();

    $this->assertDatabaseHas('users', [
        'email' => 'admin@pidelo.com',
        'role' => 'admin',
        'restaurant_id' => $restaurant->id,
    ]);
});

test('waiter can take and save an order for an occupied table', function () {
    $restaurant = Restaurant::create(['name' => 'Taco Bar']);
    
    $admin = User::create([
        'name' => 'Admin Owner',
        'email' => 'admin@taco.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'restaurant_id' => $restaurant->id,
    ]);

    $waiter = User::create([
        'name' => 'Juan Waiter',
        'email' => 'juan@taco.com',
        'password' => bcrypt('password'),
        'role' => 'waiter',
        'restaurant_id' => $restaurant->id,
    ]);

    $table = Table::create([
        'restaurant_id' => $restaurant->id,
        'number' => 'Mesa 10',
        'status' => 'free',
    ]);

    $product = Product::create([
        'restaurant_id' => $restaurant->id,
        'name' => 'Taco Al Pastor',
        'price' => 3.50,
        'category' => 'Platos Fuertes',
        'is_available' => true,
    ]);

    $response = $this->actingAs($waiter)->post(route('waiter.order.save', $table->id), [
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 3,
                'notes' => 'Con extra cilantro',
            ]
        ]
    ]);

    $response->assertRedirect(route('waiter.dashboard'));

    // Check table is occupied
    $table->refresh();
    expect($table->status)->toBe('occupied');

    // Check order total is 3 * 3.50 = 10.50
    $order = Order::where('table_id', $table->id)->where('status', 'pending')->first();
    expect($order)->not->toBeNull();
    expect($order->total_amount)->toBe(10.50);
    expect($order->waiter_id)->toBe($waiter->id);

    // Check order item notes
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'notes' => 'Con extra cilantro',
    ]);
});
