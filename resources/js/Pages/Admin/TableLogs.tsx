import { Head } from '@inertiajs/react';
import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Clock, CheckCircle2, XCircle, Power, PowerOff, Info } from 'lucide-react';

interface TableLog {
    id: number;
    action: string;
    details: any;
    created_at: string;
    created_at_human: string;
    table_number: string;
    user_name: string;
    user_role: string;
}

interface Props {
    logs: TableLog[];
}

export default function TableLogs({ logs }: Props) {
    const getActionInfo = (action: string) => {
        switch (action) {
            case 'paid':
                return {
                    label: 'Cobrada y Liberada',
                    color: 'text-emerald-600 dark:text-emerald-450',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
                    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
                    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                };
            case 'released':
                return {
                    label: 'Liberada (Sin Cobro)',
                    color: 'text-rose-600 dark:text-rose-450',
                    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
                    borderColor: 'border-rose-200 dark:border-rose-900/50',
                    icon: <XCircle className="w-5 h-5 text-rose-500" />
                };
            case 'activated':
                return {
                    label: 'Mesa Activada',
                    color: 'text-blue-600 dark:text-blue-450',
                    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
                    borderColor: 'border-blue-200 dark:border-blue-900/50',
                    icon: <Power className="w-5 h-5 text-blue-500" />
                };
            case 'deactivated':
                return {
                    label: 'Mesa Desactivada',
                    color: 'text-amber-600 dark:text-amber-450',
                    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
                    borderColor: 'border-amber-200 dark:border-amber-900/50',
                    icon: <PowerOff className="w-5 h-5 text-amber-500" />
                };
            default:
                return {
                    label: action,
                    color: 'text-gray-600 dark:text-gray-400',
                    bgColor: 'bg-gray-50 dark:bg-gray-900/30',
                    borderColor: 'border-gray-200 dark:border-gray-800',
                    icon: <Info className="w-5 h-5 text-gray-500" />
                };
        }
    };

    const formatPrice = (price: number) => {
        return '$' + Number(price).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <AdminLayout>
            <Head title="Historial de Mesas - bocado!" />

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Historial de Mesas</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Revisa qué mesero liberó, cobró o activó cada mesa y en qué momento.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        No hay actividad registrada en las mesas aún.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-850">
                        {logs.map((log) => {
                            const info = getActionInfo(log.action);
                            
                            return (
                                <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-2xl border ${info.bgColor} ${info.borderColor}`}>
                                            {info.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-extrabold text-gray-900 dark:text-white">
                                                    {log.table_number}
                                                </h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.color} ${info.bgColor} ${info.borderColor}`}>
                                                    {info.label}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <span className="font-bold">{log.user_name}</span>
                                                {log.user_role === 'waiter' && (
                                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Mesero</span>
                                                )}
                                                {log.user_role === 'admin' && (
                                                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Admin</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col md:items-end gap-1 text-sm md:text-right pl-14 md:pl-0">
                                        <div className="text-gray-900 dark:text-gray-100 font-bold">
                                            {log.action === 'paid' && log.details?.total_amount ? (
                                                <span className="text-emerald-600 dark:text-emerald-450">
                                                    {formatPrice(log.details.total_amount)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {log.created_at_human} ({log.created_at})
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
