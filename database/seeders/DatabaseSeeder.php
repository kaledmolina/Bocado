<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Table;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'kaledmoly@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
            'restaurant_id' => null,
        ]);

        // 2. Create Restaurant 1: El Rinconcito Italiano
        $rinconcito = Restaurant::create([
            'name' => 'El Rinconcito Italiano',
            'address' => 'Av. Central 456, Zona G',
            'phone' => '+54 11 2233-4455',
            'security_table_pin' => false,
            'security_waiter_activation' => false,
            'security_require_physical_scan' => false,
            'waiters_can_collect_payment' => false,
            'client_can_call_waiter' => true,
            'is_demo' => true,
        ]);

        // Rinconcito Admin/Owner
        User::create([
            'name' => 'Propietario Rinconcito',
            'email' => 'owner@rinconcito.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'restaurant_id' => $rinconcito->id,
        ]);

        // Rinconcito Waiters
        $pedro = User::create([
            'name' => 'Pedro Mesero',
            'email' => 'pedro@rinconcito.com',
            'password' => Hash::make('password'),
            'role' => 'waiter',
            'restaurant_id' => $rinconcito->id,
        ]);

        $maria = User::create([
            'name' => 'Maria Mesera',
            'email' => 'maria@rinconcito.com',
            'password' => Hash::make('password'),
            'role' => 'waiter',
            'restaurant_id' => $rinconcito->id,
        ]);

        // Rinconcito Tables
        $t1 = Table::create(['restaurant_id' => $rinconcito->id, 'number' => 'Mesa 1', 'status' => 'free', 'is_active_for_order' => true]);
        $t2 = Table::create(['restaurant_id' => $rinconcito->id, 'number' => 'Mesa 2', 'status' => 'occupied', 'is_active_for_order' => true]);
        $t3 = Table::create(['restaurant_id' => $rinconcito->id, 'number' => 'Mesa 3', 'status' => 'payment_pending', 'is_active_for_order' => true]);
        $t4 = Table::create(['restaurant_id' => $rinconcito->id, 'number' => 'Mesa 4', 'status' => 'free', 'is_active_for_order' => true]);

        // Rinconcito Products
        $p_pizza = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Pizza Margarita',
            'description' => 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.',
            'price' => 15.00,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);

        $p_lasagna = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Lasagna Boloñesa',
            'description' => 'Capas de pasta rellenas de carne boloñesa, bechamel y queso gratinado.',
            'price' => 18.50,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);

        $p_bruschetta = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Bruschetta de Tomate',
            'description' => 'Pan tostado con ajo, tomates picados, albahaca y aceite de oliva virgen.',
            'price' => 8.00,
            'category' => 'Entradas',
            'is_available' => true,
        ]);

        $p_coca = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Coca Cola',
            'description' => 'Refresco de cola de 350ml en botella de vidrio.',
            'price' => 3.00,
            'category' => 'Bebidas',
            'is_available' => true,
        ]);

        $p_limon = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Limonada Natural',
            'description' => 'Limonada refrescante endulzada y con menta fresca.',
            'price' => 3.50,
            'category' => 'Bebidas',
            'is_available' => true,
        ]);

        $p_tiramisu = Product::create([
            'restaurant_id' => $rinconcito->id,
            'name' => 'Tiramisú Clásico',
            'description' => 'Postre italiano con bizcochos soletilla café, mascarpone y cacao.',
            'price' => 6.50,
            'category' => 'Postres',
            'is_available' => true,
        ]);

        // Active Order for Mesa 2 (Occupied)
        $o2 = Order::create([
            'restaurant_id' => $rinconcito->id,
            'table_id' => $t2->id,
            'waiter_id' => $pedro->id,
            'status' => 'pending',
            'total_amount' => 18.00,
        ]);

        OrderItem::create([
            'order_id' => $o2->id,
            'product_id' => $p_pizza->id,
            'quantity' => 1,
            'price' => 15.00,
            'notes' => 'Bien tostada',
        ]);

        OrderItem::create([
            'order_id' => $o2->id,
            'product_id' => $p_coca->id,
            'quantity' => 1,
            'price' => 3.00,
        ]);

        // Active Order for Mesa 3 (Payment Pending)
        $o3 = Order::create([
            'restaurant_id' => $rinconcito->id,
            'table_id' => $t3->id,
            'waiter_id' => $maria->id,
            'status' => 'pending',
            'total_amount' => 44.00,
        ]);

        OrderItem::create([
            'order_id' => $o3->id,
            'product_id' => $p_lasagna->id,
            'quantity' => 2,
            'price' => 18.50,
        ]);

        OrderItem::create([
            'order_id' => $o3->id,
            'product_id' => $p_limon->id,
            'quantity' => 2,
            'price' => 3.50,
            'notes' => 'Con poco hielo',
        ]);


        // 3. Create Restaurant 2: Taco Loco
        $tacoloco = Restaurant::create([
            'name' => 'Taco Loco',
            'address' => 'Plaza Sur Local 12',
            'phone' => '+52 55 1234-5678',
        ]);

        // Taco Loco Admin/Owner
        User::create([
            'name' => 'Dueño Taco Loco',
            'email' => 'owner@tacoloco.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'restaurant_id' => $tacoloco->id,
        ]);

        // Taco Loco Waiter
        User::create([
            'name' => 'Carlos Taquero',
            'email' => 'carlos@tacoloco.com',
            'password' => Hash::make('password'),
            'role' => 'waiter',
            'restaurant_id' => $tacoloco->id,
        ]);

        // Taco Loco Tables
        Table::create(['restaurant_id' => $tacoloco->id, 'number' => 'Mesa A', 'status' => 'free']);
        Table::create(['restaurant_id' => $tacoloco->id, 'number' => 'Mesa B', 'status' => 'free']);

        // Taco Loco Products
        Product::create([
            'restaurant_id' => $tacoloco->id,
            'name' => 'Taco al Pastor',
            'price' => 3.50,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);

        Product::create([
            'restaurant_id' => $tacoloco->id,
            'name' => 'Quesadilla Especial',
            'price' => 8.00,
            'category' => 'Platos Fuertes',
            'is_available' => true,
        ]);

        Product::create([
            'restaurant_id' => $tacoloco->id,
            'name' => 'Nachos con Queso',
            'price' => 10.50,
            'category' => 'Entradas',
            'is_available' => true,
        ]);
    }
}
