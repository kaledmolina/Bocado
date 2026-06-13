<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\WaiterController;
use App\Http\Controllers\WaiterDashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WaiterPlatformController;
use App\Http\Controllers\CashSessionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\Restaurant;

Route::get('/', function () {
    $restaurant = Restaurant::with(['tables.activeOrder.items.product', 'products'])->first();
    
    $hiringRestaurants = App\Models\Restaurant::where('is_hiring', true)->get();
    
    $myApplications = [];
    if (Illuminate\Support\Facades\Auth::check() && Illuminate\Support\Facades\Auth::user()->isWaiter()) {
        $myApplications = App\Models\RestaurantApplication::where('user_id', Illuminate\Support\Facades\Auth::id())
            ->pluck('restaurant_id')
            ->toArray();
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'dbRestaurant' => $restaurant,
        'hiringRestaurants' => $hiringRestaurants,
        'myApplications' => $myApplications,
    ]);
});

Route::get('/job-board', function () {
    $hiringRestaurants = App\Models\Restaurant::where('is_hiring', true)->get();
    $myApplications = [];
    if (Illuminate\Support\Facades\Auth::check() && Illuminate\Support\Facades\Auth::user()->isWaiter()) {
        $myApplications = App\Models\RestaurantApplication::where('user_id', Illuminate\Support\Facades\Auth::id())
            ->pluck('restaurant_id')
            ->toArray();
    }
    return Inertia::render('JobBoard', [
        'hiringRestaurants' => $hiringRestaurants,
        'myApplications' => $myApplications,
    ]);
})->name('public.job-board');

Route::get('/simulator', function () {
    return Inertia::render('SimulatorHub');
})->name('public.simulator');

Route::get('/simulator/owner', function () {
    $restaurant = Restaurant::with(['tables.activeOrder.items.product', 'products'])->first();
    return Inertia::render('SimulatorOwner', [
        'dbRestaurant' => $restaurant,
    ]);
})->name('public.simulator.owner');

Route::get('/simulator/waiter', function () {
    $restaurant = Restaurant::with(['tables.activeOrder.items.product', 'products'])->first();
    return Inertia::render('SimulatorWaiter', [
        'dbRestaurant' => $restaurant,
    ]);
})->name('public.simulator.waiter');

Route::get('/simulator/client', function () {
    $restaurant = Restaurant::with(['tables.activeOrder.items.product', 'products'])->first();
    return Inertia::render('SimulatorClient', [
        'dbRestaurant' => $restaurant,
    ]);
})->name('public.simulator.client');

Route::get('/guide-tips', function () {
    return Inertia::render('GuideTips');
})->name('public.guide-tips');

Route::get('/api-docs', function () {
    return Inertia::render('Public/ApiDocs');
})->name('public.api-docs');

// Public QR Code Scan for tables (Client Menu / Waiter redirect)
Route::get('/tables/{qr_code_token}', [OrderController::class, 'scanQR'])->name('qr.scan');
Route::post('/tables/{qr_code_token}/request-order', [OrderController::class, 'requestClientOrder'])->name('qr.request-order');

// Waiter invitation public routes
Route::get('/waiters/invite/{token}', [WaiterController::class, 'showInviteForm'])->name('waiter.invite');
Route::post('/waiters/invite/{token}', [WaiterController::class, 'registerFromInvite'])->name('waiter.invite.register');
Route::get('/waiters/invite-pending', [WaiterController::class, 'invitePending'])->name('waiter.invite.pending');

// Combined Dashboard with role-based redirection
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin CRUD - Waiters
    Route::get('/admin/waiters', [WaiterController::class, 'index'])->name('admin.waiters');
    Route::post('/admin/waiters', [WaiterController::class, 'store'])->name('admin.waiters.store');
    Route::put('/admin/waiters/{waiter}', [WaiterController::class, 'update'])->name('admin.waiters.update');
    Route::delete('/admin/waiters/{waiter}', [WaiterController::class, 'destroy'])->name('admin.waiters.destroy');
    Route::post('/admin/waiters/{waiter}/toggle-status', [WaiterController::class, 'toggleStatus'])->name('admin.waiters.toggle-status');

    // Admin CRUD - Products
    Route::get('/admin/products', [ProductController::class, 'index'])->name('admin.products');
    Route::post('/admin/products', [ProductController::class, 'store'])->name('admin.products.store');
    Route::put('/admin/products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
    Route::delete('/admin/products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');

    // Admin CRUD - Tables
    Route::get('/admin/tables', [TableController::class, 'index'])->name('admin.tables');
    Route::post('/admin/tables', [TableController::class, 'store'])->name('admin.tables.store');
    Route::put('/admin/tables/{table}', [TableController::class, 'update'])->name('admin.tables.update');
    Route::delete('/admin/tables/{table}', [TableController::class, 'destroy'])->name('admin.tables.destroy');

    // Admin Orders list
    Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders');

    // Order Mark as Paid (Admin or Waiter)
    Route::post('/tables/{table}/pay', [OrderController::class, 'markAsPaid'])->name('tables.pay');
    
    // Release Table without payment / Cancel order (Admin or Waiter)
    Route::post('/tables/{table}/release', [OrderController::class, 'releaseTable'])->name('tables.release');
    Route::post('/tables/{table}/clear-client-cart', [OrderController::class, 'clearClientCart'])->name('tables.clear-client-cart');
    Route::post('/tables/{table}/toggle-activation', [OrderController::class, 'toggleActivation'])->name('tables.toggle-activation');

    // Admin Settings page
    Route::get('/admin/settings', [DashboardController::class, 'showSettings'])->name('admin.settings');

    // Admin Security settings
    Route::post('/admin/settings/security', [DashboardController::class, 'updateSecuritySettings'])->name('admin.settings.security');

    // Admin Cash reconciliation routes
    Route::get('/admin/cash', [CashSessionController::class, 'index'])->name('admin.cash');
    Route::post('/admin/cash/open', [CashSessionController::class, 'open'])->name('admin.cash.open');
    Route::post('/admin/cash/close', [CashSessionController::class, 'close'])->name('admin.cash.close');

    // Admin toggle view mode (admin <-> waiter)
    Route::post('/admin/toggle-view-mode', [DashboardController::class, 'toggleViewMode'])->name('admin.toggle-view-mode');

    // Waiter Dashboard and Order taking
    Route::get('/waiter/dashboard', [WaiterDashboardController::class, 'index'])->name('waiter.dashboard');
    Route::get('/waiter/tables/{table}/order', [OrderController::class, 'showOrderSheet'])->name('waiter.order');
    Route::post('/waiter/tables/{table}/order', [OrderController::class, 'saveOrder'])->name('waiter.order.save');
    Route::post('/waiter/tables/{table}/request-payment', [OrderController::class, 'requestPayment'])->name('waiter.order.request-payment');

    // SuperAdmin toggles
    Route::post('/superadmin/restaurants/{restaurant}/toggle', [DashboardController::class, 'toggleRestaurantStatus'])->name('superadmin.restaurants.toggle');
    Route::post('/superadmin/users/{user}/toggle', [DashboardController::class, 'toggleUserStatus'])->name('superadmin.users.toggle');

    // Waiter platform - Shifts
    Route::post('/waiter/shifts/start', [WaiterPlatformController::class, 'startShift'])->name('waiter.shifts.start');
    Route::post('/waiter/shifts/end', [WaiterPlatformController::class, 'endShift'])->name('waiter.shifts.end');

    // Waiter platform - Unlinking / Resignation
    Route::post('/waiter/unlink', [WaiterPlatformController::class, 'unlink'])->name('waiter.unlink');

    // Waiter platform - Job Applications
    Route::post('/waiter/apply/{restaurant}', [WaiterPlatformController::class, 'apply'])->name('waiter.apply');
    Route::post('/admin/applications/{application}', [WaiterPlatformController::class, 'processApplication'])->name('admin.applications.process');
    Route::post('/admin/settings/toggle-hiring', [WaiterPlatformController::class, 'toggleHiring'])->name('admin.toggle-hiring');

    // Waiter platform - Dismissal and Rating
    Route::post('/admin/waiters/{waiter}/rate', [WaiterPlatformController::class, 'rateWaiter'])->name('admin.waiters.rate');
    Route::post('/admin/waiters/{waiter}/hire', [WaiterPlatformController::class, 'hireWaiter'])->name('admin.waiters.hire');
    Route::post('/waiter/invitations/{application}/accept', [WaiterPlatformController::class, 'acceptInvitation'])->name('waiter.invitations.accept');
    Route::post('/waiter/invitations/{application}/reject', [WaiterPlatformController::class, 'rejectInvitation'])->name('waiter.invitations.reject');
    Route::post('/waiter/profile/settings', [WaiterPlatformController::class, 'updateProfileSettings'])->name('waiter.profile.settings');
});

// Demo Auto-Login Routes
Route::get('/demo-selector', function () {
    return Inertia::render('Auth/DemoSelector');
})->name('demo.selector');

Route::get('/demo-login/client', function () {
    $rinconcito = \App\Models\Restaurant::where('name', 'El Rinconcito Italiano')->first();
    if ($rinconcito) {
        $table = $rinconcito->tables()->where('number', 'Mesa 1')->first();
        if ($table && $table->qr_code_token) {
            return redirect()->route('qr.scan', ['qr_code_token' => $table->qr_code_token]);
        }
    }
    $table = \App\Models\Table::first();
    if ($table && $table->qr_code_token) {
        return redirect()->route('qr.scan', ['qr_code_token' => $table->qr_code_token]);
    }
    return redirect()->route('login')->with('error', 'Mesa demo no encontrada.');
})->name('demo.client');

Route::get('/demo-login/{role}', function ($role) {
    $email = match($role) {
        'superadmin' => 'kaledmoly@gmail.com',
        'owner', 'admin' => 'owner@rinconcito.com',
        'waiter', 'mesero' => 'pedro@rinconcito.com',
        default => null
    };
    
    if ($email) {
        $user = \App\Models\User::where('email', $email)->first();
        if ($user) {
            \Illuminate\Support\Facades\Auth::login($user);
            return redirect()->route('dashboard');
        }
    }
    return redirect()->route('login')->with('error', 'Usuario demo no encontrado.');
})->name('demo.login');

require __DIR__.'/auth.php';
