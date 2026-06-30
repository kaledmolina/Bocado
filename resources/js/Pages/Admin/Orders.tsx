import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    Search, 
    Eye, 
    X, 
    ChevronLeft, 
    ChevronRight,
    ClipboardList,
    Clock,
    CheckCircle,
    User,
    CreditCard,
    DollarSign,
    Layers
} from 'lucide-react';
import PaymentModal from '@/Components/PaymentModal';

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    notes: string | null;
    product: {
        name: string;
    };
}

interface Order {
    id: number | string;
    table_id: number;
    waiter_id: number | null;
    status: 'pending' | 'paid' | 'pending_approval';
    total_amount: number;
    created_at: string;
    table: {
        number: string;
        temp_pin?: string | null;
    };
    waiter: {
        name: string;
    } | null;
    items: OrderItem[];
    customer_name?: string;
    received_amount?: number | null;
    change_amount?: number | null;
}

interface Props {
    orders: Order[];
}

const ITEMS_PER_PAGE = 10;

export default function Orders({ orders }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<'All' | 'pending' | 'paid'>('pending'); // Default to pending to show active orders first
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Viewing detail modal state
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [mounted, setMounted] = useState(false);

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        tableId: number;
        totalAmount: number;
        order?: Order;
    }>({
        isOpen: false,
        tableId: 0,
        totalAmount: 0,
    });

    const [confirmModal, setConfirmModal] = useState<{
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

    const handlePay = (tableId: number, total: number, order?: Order) => {
        setPaymentModal({
            isOpen: true,
            tableId,
            totalAmount: total,
            order,
        });
    };

    const handleConfirmPayment = (receivedAmount: number, changeAmount: number) => {
        router.post(route('tables.pay', paymentModal.tableId), {
            received_amount: receivedAmount,
            change_amount: changeAmount,
        }, {
            onSuccess: () => {
                setViewingOrder(null);
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
                router.post(route('tables.release', tableId), {}, {
                    onSuccess: () => {
                        setViewingOrder(null);
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                });
            },
            isDanger: true,
        });
    };

    // Polling and chime synthesis for client requests
    const prevRequests = React.useRef<string>('');

    const [audioEnabled, setAudioEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('audio_notifications') === 'true';
        }
        return false;
    });

    const playNotificationSound = (force = false) => {
        if (!audioEnabled && !force) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
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

    React.useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            router.reload({
                only: ['orders'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        const currentRequests = orders
            .filter(o => o.status === 'pending_approval')
            .map(o => `${o.id}`)
            .join(',');

        if (prevRequests.current !== '') {
            const prevIds = new Set(prevRequests.current.split(',').filter(Boolean));
            const currentIds = currentRequests.split(',').filter(Boolean);
            const hasNewRequest = currentIds.some(id => !prevIds.has(id));

            if (hasNewRequest) {
                playNotificationSound();
            }
        }
        prevRequests.current = currentRequests;
    }, [orders]);

    // Filter logic
    const filteredOrders = orders.filter(o => {
        const matchesStatus = selectedStatus === 'All' || 
            (selectedStatus === 'pending' && (o.status === 'pending' || o.status === 'pending_approval')) ||
            o.status === selectedStatus;
        const matchesSearch = o.table.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.waiter && o.waiter.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            o.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesStatus && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchQuery]);

    return (
        <AdminLayout title="Pedidos y Órdenes">
            <Head title="Pedidos" />

            {/* Alertas y Control de Sonido */}
            <div className="flex flex-col gap-4 font-sans mb-6">
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

                {orders.some(o => o.status === 'pending_approval') && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl animate-pulse">🛎️</span>
                            <div>
                                <h3 className="font-extrabold text-sm">Nuevas solicitudes de pedidos de clientes</h3>
                                <p className="text-[11px] text-blue-100 font-medium">Hay autopedidos QR pendientes que requieren aprobación o rechazo (no requiere refrescar).</p>
                            </div>
                        </div>
                        <span className="bg-white text-blue-600 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm">
                            {orders.filter(o => o.status === 'pending_approval').length} Mesa(s)
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-6 font-sans">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-1.5 bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <button 
                            onClick={() => setSelectedStatus('pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedStatus === 'pending' 
                                    ? 'bg-orange-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Pendientes de Pago
                        </button>
                        <button 
                            onClick={() => setSelectedStatus('paid')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedStatus === 'paid' 
                                    ? 'bg-orange-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Cobrados / Historial
                        </button>
                        <button 
                            onClick={() => setSelectedStatus('All')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedStatus === 'All' 
                                    ? 'bg-orange-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Todos
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-450 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por mesa, mesero o plato..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-sm rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-800 dark:text-gray-100"
                        />
                    </div>
                </div>

                {/* Orders List */}
                {paginatedOrders.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center">
                        <ClipboardList className="w-12 h-12 text-orange-500/20 mb-3 animate-pulse" />
                        <h4 className="font-bold text-gray-700 dark:text-gray-300">No se encontraron pedidos</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {selectedStatus === 'pending' ? 'No hay mesas activas con consumos sin pagar.' : 'No hay registros en el historial.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Mesa</th>
                                        <th className="px-6 py-4">Platos Servidos</th>
                                        <th className="px-6 py-4">Mesero</th>
                                        <th className="px-6 py-4">Fecha / Hora</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-center">Total</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/30 transition-all">
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {order.table.number}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-1">
                                                    A nombre de: {order.customer_name || 'Desconocido'}
                                                </div>
                                                <div className="truncate font-medium text-gray-800 dark:text-gray-250">
                                                    {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold">
                                                {order.waiter ? order.waiter.name : 'QR Cliente / Desconocido'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {new Date(order.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    order.status === 'pending_approval'
                                                        ? 'bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                        : order.status === 'pending'
                                                        ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                                        : 'bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                                                }`}>
                                                    {order.status === 'pending_approval'
                                                        ? 'Solicitud de Mesero'
                                                        : order.status === 'pending'
                                                        ? 'Pendiente'
                                                        : 'Cobrado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-extrabold text-gray-900 dark:text-white">
                                                ${Number(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {order.status === 'pending_approval' ? (
                                                        <button
                                                            onClick={() => handleReleaseTable(order.table_id)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                                                            title="Liberar Mesa (Rechazar solicitud)"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    ) : order.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleReleaseTable(order.table_id)}
                                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                                                                title="Liberar Mesa (Sin pago)"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePay(order.table_id, Number(order.total_amount), order)}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all"
                                                                title="Cobrar y Liberar"
                                                            >
                                                                <CreditCard className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-800 pt-6 mt-4">
                        <p className="text-xs text-gray-500">
                            Mostrando <span className="font-semibold">{paginatedOrders.length}</span> de <span className="font-semibold">{filteredOrders.length}</span> pedidos
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold px-3 text-gray-700 dark:text-gray-300">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
             {/* Viewing Order Details Modal */}
            {viewingOrder && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 transform scale-100 transition-all duration-300">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-orange-500" />
                                Detalle de Pedido - {viewingOrder.table.number}
                            </h3>
                            <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <span className="text-xl">×</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 font-sans">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                                    <span className="text-[10px] text-gray-450 block font-bold uppercase">Mesero</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {viewingOrder.waiter ? viewingOrder.waiter.name : 'Pedido por QR Cliente'}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                                    <span className="text-[10px] text-gray-450 block font-bold uppercase">Estado</span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                                        viewingOrder.status === 'pending_approval'
                                            ? 'bg-blue-100 text-blue-600 border border-blue-500/20'
                                            : viewingOrder.status === 'pending'
                                            ? 'bg-amber-100 text-amber-600'
                                            : 'bg-green-105 text-green-600'
                                    }`}>
                                        {viewingOrder.status === 'pending_approval'
                                            ? 'Solicitud de Mesero'
                                            : viewingOrder.status === 'pending'
                                            ? 'Por Pagar'
                                            : 'Cobrado'}
                                    </span>
                                </div>
                            </div>

                            {viewingOrder.table.temp_pin && (
                                <div className="p-3.5 bg-orange-500/5 dark:bg-orange-950/10 border border-orange-500/10 rounded-2xl flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">🔑 PIN de Mesa Activo:</span>
                                    <span className="font-black text-orange-600 dark:text-orange-400 text-sm tracking-widest">{viewingOrder.table.temp_pin}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Platos Servidos</span>
                                <div className="max-h-60 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850">
                                    {viewingOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-extrabold text-orange-600">{item.quantity}x</span>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.product.name}</span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5 ml-6">
                                                        Nota: {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Total del Pedido:</span>
                                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                                    ${Number(viewingOrder.total_amount).toFixed(2)}
                                </span>
                            </div>

                            {viewingOrder.received_amount !== undefined && viewingOrder.received_amount !== null && (
                                <div className="space-y-1.5 pt-2.5 text-xs border-t border-dashed border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Monto Entregado:</span>
                                        <span className="font-extrabold text-gray-800 dark:text-gray-250">${Number(viewingOrder.received_amount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Cambio Devuelto:</span>
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-450">${Number(viewingOrder.change_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end items-center gap-2 pt-3">
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-250 text-xs font-bold transition-all"
                            >
                                Cerrar
                            </button>
                            {viewingOrder.status === 'pending_approval' && (
                                <button
                                    onClick={() => handleReleaseTable(viewingOrder.table_id)}
                                    className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                                >
                                    Rechazar / Liberar Mesa
                                </button>
                            )}
                            {viewingOrder.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleReleaseTable(viewingOrder.table_id)}
                                        className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
                                    >
                                        Liberar Mesa
                                    </button>
                                    <button
                                        onClick={() => handlePay(viewingOrder.table_id, Number(viewingOrder.total_amount), viewingOrder)}
                                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-102 active:scale-98"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Cobrar y Liberar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
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
                order={paymentModal.order}
                onConfirm={handleConfirmPayment}
                onCancel={() => setPaymentModal(prev => ({ ...prev, isOpen: false, order: undefined }))}
            />
        </AdminLayout>
    );
}
