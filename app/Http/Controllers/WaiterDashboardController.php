<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Models\Restaurant;
use App\Models\RestaurantApplication;
use App\Models\Shift;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WaiterDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user->isWaiter()) {
            return redirect()->route('dashboard');
        }

        $hiringRestaurants = Restaurant::where('is_hiring', true)->get();
        
        $myApplications = RestaurantApplication::where('user_id', $user->id)
            ->where('status', '!=', 'invited')
            ->with('restaurant')
            ->get();

        $jobOffers = RestaurantApplication::where('user_id', $user->id)
            ->where('status', 'invited')
            ->with('restaurant')
            ->get();

        $ratings = $user->ratings()->with('restaurant')->orderBy('created_at', 'desc')->get();

        // If waiter has no restaurant
        if (!$user->restaurant_id) {
            return Inertia::render('Waiter/Dashboard', [
                'tables' => [],
                'waiterName' => $user->name,
                'restaurant' => null,
                'hiringRestaurants' => $hiringRestaurants,
                'myApplications' => $myApplications,
                'jobOffers' => $jobOffers,
                'activeShift' => null,
                'ratings' => $ratings,
            ]);
        }

        // Fetch tables with active orders to display items/totals
        $tables = Table::where('restaurant_id', $user->restaurant_id)
            ->with(['activeOrders.items.product'])
            ->get();

        // Check active shift
        $activeShift = Shift::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        return Inertia::render('Waiter/Dashboard', [
            'tables' => $tables,
            'waiterName' => $user->name,
            'restaurant' => $user->restaurant,
            'hiringRestaurants' => $hiringRestaurants,
            'myApplications' => $myApplications,
            'jobOffers' => $jobOffers,
            'activeShift' => $activeShift,
            'ratings' => $ratings,
        ]);
    }
}
