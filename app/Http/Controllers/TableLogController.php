<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TableLog;

class TableLogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Acceso denegado');
        }

        $logs = TableLog::where('restaurant_id', $user->restaurant_id)
            ->with(['table:id,number', 'user:id,name,role'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'details' => $log->details,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $log->created_at->diffForHumans(),
                    'table_number' => $log->table ? $log->table->number : 'Desconocida',
                    'user_name' => $log->user ? $log->user->name : 'Sistema/Desconocido',
                    'user_role' => $log->user ? $log->user->role : null,
                ];
            });

        return Inertia::render('Admin/TableLogs', [
            'logs' => $logs
        ]);
    }
}
