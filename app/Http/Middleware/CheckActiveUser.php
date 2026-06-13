<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            // If user itself is disabled
            if (!$user->is_active) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Tu cuenta ha sido desactivada. Por favor, contacta al administrador.',
                ]);
            }

            // If the user's restaurant is disabled (exclude superadmin who has no restaurant)
            if ($user->role !== 'superadmin' && $user->restaurant_id) {
                $restaurant = $user->restaurant;
                if ($restaurant && !$restaurant->is_active) {
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->withErrors([
                        'email' => 'El negocio al que perteneces ha sido desactivado. Por favor, contacta al administrador.',
                    ]);
                }
            }
        }

        return $next($request);
    }
}
