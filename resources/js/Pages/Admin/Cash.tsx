import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { 
    DollarSign, 
    Calendar, 
    TrendingUp, 
    CheckCircle, 
    Lock, 
    Unlock, 
    AlertCircle, 
    RefreshCw, 
    History 
} from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface CashSession {
    id: number;
    opened_at: string;
    closed_at: string | null;
    opening_balance: number;
    opening_paid_amount_reference: number;
    expected_amount: number | null;
    real_amount: number | null;
    difference: number | null;
    user?: User;
}

interface Props {
    activeSession: CashSession | null;
    reconciliations: CashSession[];
    totalPaidAmount: number;
}

export default function Cash({ activeSession, reconciliations, totalPaidAmount }: Props) {
    const [openingBalance, setOpeningBalance] = useState('100.00');
    const [realAmount, setRealAmount] = useState('');
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Calculate current sales in shift dynamically
    const currentSalesInShift = activeSession 
        ? Math.max(0, totalPaidAmount - activeSession.opening_paid_amount_reference)
        : 0;

    const expectedTotal = activeSession 
        ? Number(activeSession.opening_balance) + currentSalesInShift
        : 0;

    const handleOpen = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.cash.open'), {
            opening_balance: parseFloat(openingBalance) || 0
        }, {
            onFinish: () => setProcessing(false)
        });
    };

    const handleClose = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.cash.close'), {
            real_amount: parseFloat(realAmount) || 0
        }, {
            onFinish: () => {
                setProcessing(false);
                setShowCloseConfirm(false);
                setRealAmount('');
            }
        });
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('es-ES', { 
                day: '2-digit', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <AdminLayout title="Arqueo de Caja">
            <Head title="Arqueo de Caja - bocado!" />

            <div className="space-y-8">
                {/* Active Session Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Opening/Closing Controller */}
                    <div className="lg:col-span-1 p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div>
                                <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-orange-500" />
                                    Caja Registradora
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Control de apertura y cierre</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                activeSession ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                                {activeSession ? 'Caja Abierta' : 'Caja Cerrada'}
                            </span>
                        </div>

                        {activeSession ? (
                            // Drawer is OPEN
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-medium">Apertura:</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">{formatDate(activeSession.opened_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-medium">Saldo Inicial:</span>
                                        <span className="font-extrabold text-gray-800 dark:text-white">${Number(activeSession.opening_balance).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-medium">Ventas del Turno:</span>
                                        <span className="font-extrabold text-green-600">${currentSalesInShift.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200/50 dark:border-gray-800 flex justify-between items-center text-sm font-black">
                                        <span className="text-gray-700 dark:text-gray-300">Total Esperado:</span>
                                        <span className="text-orange-600 dark:text-orange-400">${expectedTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {!showCloseConfirm ? (
                                    <button
                                        onClick={() => {
                                            setRealAmount(expectedTotal.toFixed(2));
                                            setShowCloseConfirm(true);
                                        }}
                                        disabled={processing}
                                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                                    >
                                        🔒 Realizar Arqueo y Cerrar Caja
                                    </button>
                                ) : (
                                    <form onSubmit={handleClose} className="space-y-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl animate-fade-in">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">Efectivo Real Contado en Caja</label>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={realAmount}
                                                onChange={e => setRealAmount(e.target.value)}
                                                placeholder="Contar monedas y billetes"
                                                className="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-500 text-gray-850 dark:text-white font-bold"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition-all shadow cursor-pointer"
                                            >
                                                Confirmar Cierre
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowCloseConfirm(false)}
                                                className="py-2 px-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            // Drawer is CLOSED
                            <form onSubmit={handleOpen} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Monto Inicial de Apertura</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={openingBalance}
                                        onChange={e => setOpeningBalance(e.target.value)}
                                        placeholder="Ej. 100.00"
                                        className="w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-800 dark:text-white font-bold"
                                    />
                                    <p className="text-[10px] text-gray-400">
                                        El efectivo de reserva para cambio/vuelto al iniciar el turno.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
                                >
                                    🔓 Abrir Caja para Turno
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Active shift metrics / info card */}
                    <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Estado de Ventas Actuales
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Cruce de información entre base de datos y caja física</p>
                        </div>

                        {activeSession ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-4 bg-orange-505/5 dark:bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Saldo en Sistema</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white block mt-1">${expectedTotal.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-green-505/5 dark:bg-green-500/5 border border-green-500/10 rounded-2xl">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Vendido en Turno</span>
                                    <span className="text-lg font-black text-green-600 block mt-1">${currentSalesInShift.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-blue-505/5 dark:bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Punto de Partida</span>
                                    <span className="text-lg font-black text-blue-600 block mt-1">${Number(activeSession.opening_paid_amount_reference).toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-850 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                                <AlertCircle className="w-8 h-8 text-gray-400" />
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">La caja está cerrada temporalmente</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                                    Abre la caja ingresando un saldo inicial para activar el monitoreo automático de transacciones.
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 flex items-start gap-2.5">
                            <span className="text-base">💡</span>
                            <div>
                                <span className="font-bold text-gray-700 dark:text-gray-300">¿Cómo funciona la validación?</span> El sistema almacena una "foto" del total facturado acumulado al abrir la caja. Toda venta cobrada desde ese momento se suma de forma aislada a las ventas del turno, impidiendo discrepancias con turnos anteriores.
                            </div>
                        </div>
                    </div>
                </div>

                {/* History of Cash Reconciliations */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
                    <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <History className="w-5 h-5 text-orange-500" />
                        Historial de Arqueos de Caja
                    </h3>

                    {reconciliations.length === 0 ? (
                        <div className="p-10 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                            No se han registrado arqueos de caja anteriores.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-bold">
                                        <th className="py-3 px-4">Fecha Cierre</th>
                                        <th className="py-3 px-4">Administrador</th>
                                        <th className="py-3 px-4">Saldo Apertura</th>
                                        <th className="py-3 px-4">Ventas Turno</th>
                                        <th className="py-3 px-4">Esperado</th>
                                        <th className="py-3 px-4">Contado Real</th>
                                        <th className="py-3 px-4 text-right">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciliations.map((rec) => {
                                        const salesInShiftVal = Number(rec.expected_amount || 0) - Number(rec.opening_balance || 0);
                                        return (
                                            <tr key={rec.id} className="border-b border-gray-50 dark:border-gray-850/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                                                <td className="py-3 px-4 font-semibold">{formatDate(rec.closed_at || '')}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">{rec.user?.name || 'Sistema'}</td>
                                                <td className="py-3 px-4 text-gray-500">${Number(rec.opening_balance).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">${salesInShiftVal.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-gray-500">${Number(rec.expected_amount).toFixed(2)}</td>
                                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-200">${Number(rec.real_amount).toFixed(2)}</td>
                                                <td className={`py-3 px-4 text-right font-black ${
                                                    Number(rec.difference) === 0 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : Number(rec.difference) > 0 
                                                        ? 'text-blue-600 dark:text-blue-400' 
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {Number(rec.difference) === 0 ? (
                                                        <span className="inline-flex items-center gap-1">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Cuadrado
                                                        </span>
                                                    ) : Number(rec.difference) > 0 ? (
                                                        `+$${Number(rec.difference).toFixed(2)} (Sobrante)`
                                                    ) : (
                                                        `-$${Math.abs(Number(rec.difference)).toFixed(2)} (Faltante)`
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
