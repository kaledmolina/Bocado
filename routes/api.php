<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ApiRestaurantController;
use App\Http\Controllers\Api\ApiTableController;
use App\Http\Controllers\Api\ApiOrderController;
use App\Http\Controllers\Api\ApiWaiterController;
use App\Http\Controllers\Api\ApiCashController;
use App\Http\Controllers\Api\ApiDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [ApiAuthController::class, 'register']);
Route::post('/auth/login', [ApiAuthController::class, 'login']);

Route::get('/restaurants/{id}', [ApiRestaurantController::class, 'show']);
Route::get('/restaurants/{id}/menu', [ApiRestaurantController::class, 'menu']);
Route::get('/jobs', [ApiRestaurantController::class, 'jobs']);

Route::get('/tables/{qr_code_token}', [ApiTableController::class, 'scan']);
Route::post('/tables/{qr_code_token}/order', [ApiOrderController::class, 'requestClientOrder']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth profile & logout
    Route::get('/auth/me', [ApiAuthController::class, 'me']);
    Route::post('/auth/logout', [ApiAuthController::class, 'logout']);

    // Restaurant administration
    Route::get('/dashboard', [ApiDashboardController::class, 'index']);
    Route::post('/restaurants/settings/toggle-hiring', [ApiRestaurantController::class, 'toggleHiring']);

    // Tables management
    Route::get('/tables', [ApiTableController::class, 'index']);
    Route::post('/tables', [ApiTableController::class, 'store']);
    Route::put('/tables/{table}', [ApiTableController::class, 'update']);
    Route::delete('/tables/{table}', [ApiTableController::class, 'destroy']);
    Route::post('/tables/{table}/toggle-activation', [ApiTableController::class, 'toggleActivation']);

    // Order operations
    Route::get('/orders/active', [ApiOrderController::class, 'activeOrders']);
    Route::post('/tables/{table}/waiter-order', [ApiOrderController::class, 'saveOrder']);
    Route::post('/tables/{table}/pay', [ApiOrderController::class, 'markAsPaid']);
    Route::post('/tables/{table}/release', [ApiOrderController::class, 'releaseTable']);
    Route::post('/tables/{table}/clear-client-cart', [ApiOrderController::class, 'clearClientCart']);
    Route::post('/tables/{table}/request-payment', [ApiOrderController::class, 'requestPayment']);

    // Waiter actions
    Route::post('/waiter/shifts/start', [ApiWaiterController::class, 'startShift']);
    Route::post('/waiter/shifts/end', [ApiWaiterController::class, 'endShift']);
    Route::post('/waiter/apply/{restaurant}', [ApiWaiterController::class, 'apply']);
    Route::get('/waiter/profile', [ApiWaiterController::class, 'profile']);

    // Cash sessions
    Route::get('/cash/status', [ApiCashController::class, 'status']);
    Route::post('/cash/open', [ApiCashController::class, 'open']);
    Route::post('/cash/close', [ApiCashController::class, 'close']);
});
