import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import React from 'react';
import ConfirmModal from '@/Components/ConfirmModal';
import PaymentModal from '@/Components/PaymentModal';
import { 
    DollarSign, 
    Clock, 
    Utensils, 
    AlertCircle, 
    CreditCard, 
    Users, 
    TrendingUp, 
    ChefHat,
    Award,
    CheckCircle,
    UserCheck
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid, 
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface WaiterStat {
    waiter_name: string;
    total_sales: number;
    orders_count: number;
}

interface TableStat {
    table_number: string;
    total_sales: number;
}

interface TableDetail {
    id: number;
    number: string;
    status: 'free' | 'occupied' | 'payment_pending';
    temp_pin?: string | null;
    pin_requested?: boolean;
    cart_data?: Array<{
        product_id: number;
        name: string;
        price: number;
        quantity: number;
        notes?: string;
    }> | null;
    active_order?: {
        id: number;
        total_amount: number;
        waiter?: {
            name: string;
        };
        items: Array<{
            id: number;
            quantity: number;
            price: number;
            notes?: string;
            product: {
                name: string;
            }
        }>
    }
}

interface Props {
    restaurant: {
        name: string;
        security_waiter_activation: boolean;
        security_table_pin: boolean;
        security_require_physical_scan: boolean;
        waiters_can_collect_payment: boolean;
    };
    salesByWaiter: WaiterStat[];
    salesByTable: TableStat[];
    tablesStatus: {
        free: number;
        occupied: number;
        payment_pending: number;
    };
    ordersSummary: {
        [key: string]: {
            status: string;
            count: number;
            total: number;
        }
    };
    pendingTables: TableDetail[];
    activeCashSession: any;
}

interface CashSession {
    isOpen: boolean;
    openedAt: string | null;
    openingBalance: number;
    openingPaidAmountReference: number;
}

interface CashReconciliation {
    id: number;
    openedAt: string;
    closedAt: string;
    openingBalance: number;
    salesInShift: number;
    expectedTotal: number;
    realTotal: number;
    difference: number;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308', '#64748b'];

export default function Dashboard({
    restaurant,
    salesByWaiter,
    salesByTable,
    tablesStatus,
    ordersSummary,
    pendingTables,
    activeCashSession
}: Props) {

    const { flash } = usePage().props as any;
    const [openCashModal, setOpenCashModal] = React.useState(false);
    const [openingBalance, setOpeningBalance] = React.useState('100.00');
    const [openingCash, setOpeningCash] = React.useState(false);

    const [confirmModal, setConfirmModal] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
        isDanger?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const [paymentModal, setPaymentModal] = React.useState<{
        isOpen: boolean;
        tableId: number;
        totalAmount: number;
    }>({
        isOpen: false,
        tableId: 0,
        totalAmount: 0,
    });

    React.useEffect(() => {
        if (flash?.error && (flash.error.includes('caja registradora está cerrada') || flash.error.includes('caja está cerrada') || flash.error.includes('abre la caja antes de cobrar'))) {
            setOpenCashModal(true);
        }
    }, [flash]);

    const handleOpenCash = (e: React.FormEvent) => {
        e.preventDefault();
        setOpeningCash(true);
        router.post(route('admin.cash.open'), {
            opening_balance: parseFloat(openingBalance) || 0
        }, {
            onSuccess: () => {
                setOpenCashModal(false);
            },
            onFinish: () => setOpeningCash(false)
        });
    };

    const handlePay = (tableId: number, total: number) => {
        if (!activeCashSession) {
            setOpenCashModal(true);
            return;
        }
        setPaymentModal({
            isOpen: true,
            tableId,
            totalAmount: total,
        });
    };

    const handleConfirmPayment = (receivedAmount: number, changeAmount: number) => {
        router.post(route('tables.pay', paymentModal.tableId), {
            received_amount: receivedAmount,
            change_amount: changeAmount,
        }, {
            onSuccess: () => {
                setPaymentModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleReleaseTable = (tableId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Liberar Mesa',
            message: '¿Estás seguro de liberar esta mesa sin registrar pago? El pedido activo se cancelará.',
            confirmLabel: 'Liberar Mesa',
            onConfirm: () => {
                router.post(route('tables.release', tableId));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    // Polling and chime synthesis for client requests
    const [audioEnabled, setAudioEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('audio_notifications');
            return stored === null ? true : stored === 'true';
        }
        return true;
    });

    const audioContextRef = React.useRef<AudioContext | null>(null);

    const initAudio = () => {
        if (typeof window === 'undefined') return;
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    // Initialize/resume AudioContext on any user interaction
    React.useEffect(() => {
        const handleInteraction = () => {
            initAudio();
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    const playNotificationSound = (force = false) => {
        if (!audioEnabled && !force) return;
        try {
            initAudio();
            const ctx = audioContextRef.current;
            if (!ctx) return;
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1200, ctx.currentTime);
            
            gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.8);
            osc2.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleAudio = () => {
        const newValue = !audioEnabled;
        setAudioEnabled(newValue);
        localStorage.setItem('audio_notifications', String(newValue));
        if (newValue) {
            setTimeout(() => playNotificationSound(true), 50);
        }
    };

    const isFirstRender = React.useRef(true);
    const prevRequests = React.useRef<string>('');

    React.useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['pendingTables', 'tablesStatus', 'ordersSummary'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const currentRequests = pendingTables
            .filter(t => t.cart_data && t.cart_data.length > 0)
            .map(t => `${t.id}-${t.cart_data!.length}`)
            .join(',');

        if (isFirstRender.current) {
            prevRequests.current = currentRequests;
            isFirstRender.current = false;
            return;
        }

        const prevMap = new Map(
            prevRequests.current.split(',').filter(Boolean).map(item => {
                const [id, count] = item.split('-');
                return [id, parseInt(count, 10)];
            })
        );

        let hasNewRequest = false;
        if (currentRequests) {
            currentRequests.split(',').filter(Boolean).forEach(item => {
                const [id, countStr] = item.split('-');
                const count = parseInt(countStr, 10);
                const prevCount = prevMap.get(id);
                if (prevCount === undefined || count > prevCount) {
                    hasNewRequest = true;
                }
            });
        }

        if (hasNewRequest) {
            playNotificationSound();
        }
        prevRequests.current = currentRequests;
    }, [pendingTables]);

    // Calculate totals
    const totalPaidAmount = Number(ordersSummary['paid']?.total || 0);
    const totalPaidCount = ordersSummary['paid']?.count || 0;
    const totalPendingAmount = Number(ordersSummary['pending']?.total || 0);
    const totalPendingCount = ordersSummary['pending']?.count || 0;

    const currentSalesInShift = activeCashSession 
        ? Math.max(0, totalPaidAmount - Number(activeCashSession.opening_paid_amount_reference))
        : 0;

    const expectedTotalInDrawer = activeCashSession 
        ? Number(activeCashSession.opening_balance) + currentSalesInShift
        : 0;

    // Convert string sales to numbers for charting
    const waiterChartData = salesByWaiter.map(item => ({
        name: item.waiter_name,
        ventas: Number(item.total_sales),
        pedidos: item.orders_count
    }));

    const tableChartData = salesByTable.map(item => ({
        name: item.table_number,
        value: Number(item.total_sales)
    }));

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3 rounded-2xl shadow-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{label}</p>
                    <p className="text-orange-500 font-bold text-base">
                        ${payload[0].value.toFixed(2)}
                    </p>
                    {payload[1] && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {payload[1].value} pedidos
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3 rounded-2xl shadow-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-1">{payload[0].name}</p>
                    <p className="text-blue-500 font-bold text-base">
                        ${payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout title="Panel de Control">
            <Head title="Admin Dashboard" />

            {/* Alertas y Control de Sonido */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 px-6 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📢</span>
                        <div>
                            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Alertas en tiempo real</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Las solicitudes se actualizan automáticamente en segundo plano cada 5s.</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleAudio}
                        type="button"
                        className={`py-2 px-4 flex items-center gap-2 font-black text-xs rounded-2xl transition-all hover:scale-102 active:scale-98 border ${
                            audioEnabled
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
                        }`}
                        title={audioEnabled ? "Desactivar sonido" : "Activar sonido de notificaciones"}
                    >
                        {audioEnabled ? "🔔 Sonido Activado" : "🔕 Activar Sonido"}
                    </button>
                </div>

                {pendingTables.some(t => t.cart_data && t.cart_data.length > 0) && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-pulse">🛎️</span>
                            <div>
                                <h3 className="font-extrabold text-sm">Nuevas solicitudes de pedidos de clientes</h3>
                                <p className="text-[11px] text-blue-100 font-medium">Hay mesas con autopedidos QR pendientes de aprobación en el panel (no requiere refrescar).</p>
                            </div>
                        </div>
                        <span className="bg-white text-blue-600 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm">
                            {pendingTables.filter(t => t.cart_data && t.cart_data.length > 0).length} Mesa(s)
                        </span>
                    </div>
                )}
            </div>



            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* 1. Cantidad de Ventas */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.01]">
                    <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-inner">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ventas Totales</p>
                        <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-gray-100">{totalPaidCount}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Pedidos cobrados</p>
                    </div>
                </div>

                {/* 2. Ingresos Totales */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.01]">
                    <div className="w-11 h-11 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shadow-inner">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ingreso Total</p>
                        <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-gray-100">${totalPaidAmount.toFixed(2)}</h4>
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5 flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" />
                            Facturado
                        </p>
                    </div>
                </div>

                {/* 3. Ticket Promedio */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.01]">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ticket Promedio</p>
                        <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-gray-100">
                            ${(totalPaidCount > 0 ? totalPaidAmount / totalPaidCount : 0).toFixed(2)}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Por cada mesa</p>
                    </div>
                </div>

                {/* 4. Ocupación de Mesas */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.01]">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ocupación</p>
                        <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-gray-100">
                            {tablesStatus.occupied + tablesStatus.payment_pending} / {tablesStatus.free + tablesStatus.occupied + tablesStatus.payment_pending}
                        </h4>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">{tablesStatus.free} libres</p>
                    </div>
                </div>

                {/* 5. Cuentas Pendientes */}
                <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.01]">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Por Cobrar</p>
                        <h4 className="text-xl font-black mt-1 text-gray-900 dark:text-gray-100">${totalPendingAmount.toFixed(2)}</h4>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-0.5">
                            <CreditCard className="w-3 h-3" />
                            {totalPendingCount} pendientes
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Waiter Sales Chart */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Award className="w-5 h-5 text-orange-500" />
                                Desempeño de Meseros
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total de ventas en dinero por cada mesero</p>
                        </div>
                    </div>
                    
                    {waiterChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                            <p className="text-sm text-gray-400">No hay ventas registradas para graficar</p>
                        </div>
                    ) : (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={waiterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800/40" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} />
                                    <Bar dataKey="ventas" radius={[8, 8, 0, 0]}>
                                        {waiterChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Table Income Chart */}
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Ingresos por Mesa
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Distribución de ingresos generados por mesa</p>
                        </div>
                    </div>

                    {tableChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                            <p className="text-sm text-gray-400">No hay ventas registradas para graficar</p>
                        </div>
                    ) : (
                        <div className="h-auto lg:h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="w-full sm:w-2/3 h-56 sm:h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tableChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {tableChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/3 flex flex-row sm:flex-col flex-wrap justify-center gap-2 text-xs mt-2 sm:mt-0">
                                {tableChartData.slice(0, 5).map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850 px-2 py-1 rounded-xl border border-gray-150/40 dark:border-gray-800/40">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{entry.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400 font-bold">${entry.value.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Central Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tables and Active Accounts */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-gray-850 dark:text-gray-200 flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-orange-500" />
                        Monitoreo de Mesas Activas
                    </h3>

                    {pendingTables.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl">
                            <span className="text-4xl">🎉</span>
                            <h4 className="font-semibold mt-3 text-gray-700 dark:text-gray-300">¡Todas las mesas están libres!</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No hay pedidos pendientes de cobro o preparación en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingTables.map((table) => (
                                <div
                                    key={table.id}
                                    className={`p-6 bg-white dark:bg-gray-900 border rounded-3xl shadow-sm flex flex-col justify-between transition-all ${
                                        table.cart_data && table.cart_data.length > 0 && !table.active_order
                                            ? 'border-blue-400 dark:border-blue-800 ring-2 ring-blue-400/10'
                                            : table.status === 'payment_pending'
                                            ? 'border-rose-400 dark:border-rose-800 ring-2 ring-rose-400/20'
                                            : 'border-gray-150 dark:border-gray-800'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{table.number}</h4>
                                                {table.temp_pin && (
                                                    <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md font-black">
                                                        PIN: {table.temp_pin}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                table.cart_data && table.cart_data.length > 0 && !table.active_order
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    : table.status === 'payment_pending'
                                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {table.cart_data && table.cart_data.length > 0 && !table.active_order
                                                    ? 'Solicitud de Pedido'
                                                    : table.status === 'payment_pending'
                                                    ? 'Por Cobrar'
                                                    : 'Ocupada'}
                                            </span>
                                        </div>

                                        {table.pin_requested && (
                                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-700 dark:text-amber-450 font-black animate-pulse flex items-center justify-between gap-2">
                                                <span>🛎️ Cliente solicita PIN de mesa</span>
                                                <button
                                                    onClick={() => router.post(route('tables.toggle-activation', table.id))}
                                                    className="px-2 py-1 bg-amber-500 text-white rounded-lg text-[9px] hover:scale-105 active:scale-95 transition-all font-black"
                                                >
                                                    Dictar PIN
                                                </button>
                                            </div>
                                        )}

                                        {table.active_order ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Mesero: <span className="font-semibold text-gray-700 dark:text-gray-300">{table.active_order.waiter?.name || 'Desconocido'}</span>
                                                </p>
                                                <div className="max-h-48 overflow-y-auto border-t border-b border-gray-100 dark:border-gray-800 py-3 space-y-2">
                                                    {table.active_order.items.map((item) => (
                                                        <div key={item.id} className="flex justify-between text-sm">
                                                            <div className="flex-1">
                                                                <span className="font-semibold text-orange-600 mr-2">{item.quantity}x</span>
                                                                <span className="text-gray-700 dark:text-gray-300">{item.product.name}</span>
                                                                {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">Nota: {item.notes}</p>}
                                                            </div>
                                                            <span className="font-medium text-gray-600 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-sm font-medium text-gray-500">Total acumulado:</span>
                                                    <span className="text-xl font-bold text-gray-900 dark:text-white">${table.active_order.total_amount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ) : table.cart_data && table.cart_data.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Origen: <span className="font-semibold text-blue-600 dark:text-blue-400">Autopedido QR Cliente</span>
                                                </p>
                                                <div className="max-h-48 overflow-y-auto border-t border-b border-blue-500/10 py-3 space-y-2 bg-blue-500/5 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-500/10">
                                                    {table.cart_data.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <div className="flex-1">
                                                                <span className="font-semibold text-blue-605 dark:text-blue-400 mr-2">{item.quantity}x</span>
                                                                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                                                                {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">Nota: {item.notes}</p>}
                                                            </div>
                                                            <span className="font-medium text-gray-600 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-sm font-medium text-gray-500">Total Solicitado:</span>
                                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                        ${table.cart_data.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic py-6 text-center">Mesa sin consumos activos.</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-6">
                                        {table.cart_data && table.cart_data.length > 0 && !table.active_order ? (
                                            <button
                                                onClick={() => handleReleaseTable(table.id)}
                                                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-950/40 font-black rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5"
                                            >
                                                ❌ Rechazar y Liberar Mesa
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleReleaseTable(table.id)}
                                                    className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-950/40 font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5"
                                                >
                                                    Liberar
                                                </button>
                                                <button
                                                    onClick={() => handlePay(table.id, Number(table.active_order?.total_amount || 0))}
                                                    className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    Cobrar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Analytics List */}
                <div className="space-y-6">
                    {/* Arqueo de Caja (Cash Reconciliation) Card */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                            <div>
                                <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <span className="text-orange-500">💰</span>
                                    Arqueo de Caja
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Control de flujos de efectivo</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                activeCashSession ? 'bg-green-500/10 text-green-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                                {activeCashSession ? 'Abierta' : 'Cerrada'}
                            </span>
                        </div>

                        {activeCashSession ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl border border-gray-105 dark:border-gray-800">
                                    <div>
                                        <span className="text-gray-450 dark:text-gray-500 block text-[9px] uppercase font-bold">Saldo Inicial</span>
                                        <span className="font-extrabold text-gray-800 dark:text-white">${Number(activeCashSession.opening_balance).toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-gray-500 block text-[9px] uppercase font-bold">Ventas Turno</span>
                                        <span className="font-extrabold text-green-600">${currentSalesInShift.toFixed(2)}</span>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-gray-200/50 dark:border-gray-800 flex justify-between text-xs font-black">
                                        <span className="text-gray-500">Total Esperado:</span>
                                        <span className="text-gray-900 dark:text-white">${expectedTotalInDrawer.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.cash')}
                                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    🔒 Realizar Arqueo / Cierre
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4 text-center py-2">
                                <p className="text-xs text-gray-500">
                                    La caja registradora está actualmente cerrada. Abre la caja para poder registrar pagos.
                                </p>
                                <Link
                                    href={route('admin.cash')}
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    🔓 Ir a Abrir Caja
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Waiters stats table list */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm">
                        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-500" />
                            Detalle de Ventas
                        </h3>
                        {salesByWaiter.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aún no hay ventas registradas.</p>
                        ) : (
                            <div className="space-y-4">
                                {salesByWaiter.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{stat.waiter_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.orders_count} pedidos atendidos</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">${Number(stat.total_sales).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Table Sales List */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm">
                        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-500" />
                            Ingreso Histórico Mesas
                        </h3>
                        {salesByTable.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aún no hay ventas registradas.</p>
                        ) : (
                            <div className="space-y-4">
                                {salesByTable.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 font-medium">🪑</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{stat.table_number}</span>
                                        </div>
                                        <span className="font-bold text-orange-600 dark:text-orange-400">${Number(stat.total_sales).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                isDanger={confirmModal.isDanger}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
            <PaymentModal
                isOpen={paymentModal.isOpen}
                title="Registrar Cobro"
                totalAmount={paymentModal.totalAmount}
                onConfirm={handleConfirmPayment}
                onCancel={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
            />
            {openCashModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-base font-black flex items-center gap-2 text-gray-900 dark:text-white">
                                <DollarSign className="w-5 h-5 text-orange-500" />
                                Abrir Caja Registradora
                            </h3>
                            <button onClick={() => setOpenCashModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <span className="text-xl">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleOpenCash} className="space-y-4">
                            <div className="p-4 bg-rose-500/10 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 text-xs font-semibold flex items-start gap-2.5">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>La caja registradora está actualmente cerrada. Debes abrir la caja antes de registrar cualquier cobro.</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-500 dark:text-gray-450 uppercase block">
                                    Monto Inicial de Apertura ($)
                                </label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(e.target.value)}
                                        placeholder="100.00"
                                        className="w-full pl-9 pr-4 py-3 bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 text-sm font-extrabold rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 dark:text-white"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Dinero inicial para cambio/vuelto en este turno de caja.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setOpenCashModal(false)}
                                    className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-250 text-xs font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={openingCash}
                                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                                >
                                    🔓 Abrir Caja
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
