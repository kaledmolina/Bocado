import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    TrendingUp, DollarSign, Users, ArrowLeft, Plus, Trash2, Star, Award, 
    Layers, QrCode, Receipt, CheckCircle, HelpCircle, AlertCircle, RefreshCw, Zap,
    ChefHat, CreditCard, UserCheck, X
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie 
} from 'recharts';

interface TableItem {
    id: number;
    quantity: number;
    price: number;
    notes?: string;
    product: {
        name: string;
    };
}

interface Table {
    id: number;
    number: string;
    status: 'free' | 'occupied' | 'payment_pending';
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
        items: TableItem[];
    } | null;
}

interface WaiterStat {
    waiter_name: string;
    total_sales: number;
    orders_count: number;
}

interface TableStat {
    table_number: string;
    total_sales: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
}

interface WaiterApplication {
    id: number;
    name: string;
    experience: string;
    rating: number;
    status: 'pending' | 'hired' | 'rejected';
}

interface CashSession {
    isOpen: boolean;
    openedAt: string | null;
    openingBalance: number;
    salesInShift: number;
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

interface Props {
    dbRestaurant?: {
        name: string;
        tables: Array<{
            id: number;
            number: string;
            status: 'free' | 'occupied' | 'payment_pending';
            qr_code_token?: string;
        }>;
        products: Array<{
            id: number;
            name: string;
            price: number | string;
            category: string;
            description: string | null;
        }>;
    } | null;
}

export default function SimulatorOwner({ dbRestaurant }: Props) {
    // 1. Initial State matching real web variables
    const [tables, setTables] = useState<Table[]>(() => {
        if (dbRestaurant && dbRestaurant.tables && dbRestaurant.tables.length > 0) {
            return dbRestaurant.tables.map((t, idx) => ({
                id: t.id,
                number: t.number,
                status: t.status || 'free',
                cart_data: null,
                active_order: null
            }));
        }
        return [
            { id: 1, number: 'Mesa 1', status: 'free', cart_data: null, active_order: null },
            { 
                id: 2, 
                number: 'Mesa 2', 
                status: 'occupied', 
                cart_data: null, 
                active_order: {
                    id: 101,
                    total_amount: 18.00,
                    waiter: { name: 'Sofía Martínez' },
                    items: [
                        { id: 1, quantity: 1, price: 15.00, product: { name: 'Pizza Margarita' } },
                        { id: 2, quantity: 1, price: 3.00, product: { name: 'Coca Cola' } }
                    ]
                }
            },
            { 
                id: 3, 
                number: 'Mesa 3', 
                status: 'payment_pending', 
                cart_data: null, 
                active_order: {
                    id: 102,
                    total_amount: 44.00,
                    waiter: { name: 'Juan Gómez' },
                    items: [
                        { id: 3, quantity: 2, price: 18.50, product: { name: 'Lasagna Boloñesa' } },
                        { id: 4, quantity: 2, price: 3.50, product: { name: 'Limonada Natural' } }
                    ]
                }
            },
            { 
                id: 4, 
                number: 'Mesa 4', 
                status: 'occupied', 
                cart_data: [
                    { product_id: 1, name: 'Pizza Margarita', price: 15.00, quantity: 1, notes: 'Fina' }
                ], 
                active_order: null 
            }
        ];
    });

    const [salesByWaiter, setSalesByWaiter] = useState<WaiterStat[]>([
        { waiter_name: 'Sofía Martínez', total_sales: 125.00, orders_count: 5 },
        { waiter_name: 'Juan Gómez', total_sales: 85.50, orders_count: 3 }
    ]);

    const [salesByTable, setSalesByTable] = useState<TableStat[]>([
        { table_number: 'Mesa 2', total_sales: 78.00 },
        { table_number: 'Mesa 3', total_sales: 112.50 },
        { table_number: 'Mesa 4', total_sales: 20.00 }
    ]);

    const [ordersSummary, setOrdersSummary] = useState({
        paid: { count: 8, total: 210.50 },
        pending: { count: 1, total: 44.00 }
    });

    const [products, setProducts] = useState<Product[]>(() => {
        if (dbRestaurant && dbRestaurant.products && dbRestaurant.products.length > 0) {
            return dbRestaurant.products.map(p => ({
                id: p.id,
                name: p.name,
                price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                category: p.category || 'Platos Fuertes',
                description: p.description || 'Plato del menú real.'
            }));
        }
        return [
            { id: 1, name: 'Pizza Margarita', price: 15.00, category: 'Platos Fuertes', description: 'Mozzarella y albahaca.' },
            { id: 2, name: 'Lasagna Boloñesa', price: 18.50, category: 'Platos Fuertes', description: 'Bechamel y carne.' },
            { id: 3, name: 'Bruschetta de Tomate', price: 8.05, category: 'Entradas', description: 'Tomate, ajo y oliva.' },
            { id: 4, name: 'Coca Cola', price: 3.00, category: 'Bebidas', description: 'Refresco frío.' },
            { id: 5, name: 'Limonada Natural', price: 3.50, category: 'Bebidas', description: 'Limón exprimido.' },
            { id: 6, name: 'Tiramisú Clásico', price: 6.50, category: 'Postres', description: 'Mascarpone y café.' }
        ];
    });

    const [waiters, setWaiters] = useState<WaiterApplication[]>([
        { id: 1, name: 'Juan Gómez', experience: '2 años', rating: 4.5, status: 'hired' },
        { id: 2, name: 'Sofía Martínez', experience: '5 años', rating: 4.8, status: 'hired' },
        { id: 3, name: 'Carlos Ruíz', experience: '6 meses', rating: 4.0, status: 'pending' }
    ]);

    // Form States
    const [newTableName, setNewTableName] = useState('');
    const [newProdName, setNewProdName] = useState('');
    const [newProdPrice, setNewProdPrice] = useState('');
    const [newProdCategory, setNewProdCategory] = useState('Platos Fuertes');
    const [newProdDescription, setNewProdDescription] = useState('');

    const [activeFlowStep, setActiveFlowStep] = useState<number>(1);
    const [audioEnabled, setAudioEnabled] = useState(true);

    // Cash Reconciliation (Arqueo) States
    const [cashSession, setCashSession] = useState<CashSession>({
        isOpen: true,
        openedAt: '08:00 AM',
        openingBalance: 100.00,
        salesInShift: 0.00
    });

    const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([
        {
            id: 1,
            openedAt: '08:00 AM',
            closedAt: '04:00 PM',
            openingBalance: 100.00,
            salesInShift: 210.50,
            expectedTotal: 310.50,
            realTotal: 310.50,
            difference: 0.00
        }
    ]);

    const [openingAmountInput, setOpeningAmountInput] = useState('100.00');
    const [closingRealAmountInput, setClosingRealAmountInput] = useState('');
    const [showCloseDrawerModal, setShowCloseDrawerModal] = useState(false);

    // Dynamic stats calculations
    const freeTablesCount = tables.filter(t => t.status === 'free' && (!t.cart_data || t.cart_data.length === 0)).length;
    const occupiedTablesCount = tables.filter(t => t.status === 'occupied' || (t.cart_data && t.cart_data.length > 0)).length;
    const pendingTablesCount = tables.filter(t => t.status === 'payment_pending').length;

    // Simulation helpers
    const handleSimulateCustomerArrival = () => {
        const free = tables.filter(t => t.status === 'free');
        if (free.length === 0) {
            alert("No hay mesas libres.");
            return;
        }
        const randomTable = free[Math.floor(Math.random() * free.length)];
        const waitersList = waiters.filter(w => w.status === 'hired');
        const randomWaiterName = waitersList.length > 0 ? waitersList[Math.floor(Math.random() * waitersList.length)].name : 'Auto-Mesero';

        const mockItems = [
            { id: 1, quantity: 2, price: 15.00, product: { name: 'Pizza Margarita' } },
            { id: 2, quantity: 1, price: 3.50, product: { name: 'Limonada Natural' } }
        ];

        setTables(tables.map(t => 
            t.id === randomTable.id 
                ? {
                    ...t,
                    status: 'occupied',
                    active_order: {
                        id: Date.now(),
                        total_amount: 33.50,
                        waiter: { name: randomWaiterName },
                        items: mockItems
                    }
                }
                : t
        ));
        setActiveFlowStep(3);
    };

    const handleSimulateBillRequest = () => {
        const occupied = tables.filter(t => t.status === 'occupied' && t.active_order);
        if (occupied.length === 0) {
            alert("No hay mesas ocupadas comiendo.");
            return;
        }
        const randomTable = occupied[Math.floor(Math.random() * occupied.length)];
        setTables(tables.map(t => t.id === randomTable.id ? { ...t, status: 'payment_pending' } : t));
        setActiveFlowStep(3);
    };

    // Table Pay
    const handlePay = (tableId: number, total: number, waiterName?: string, tableName?: string) => {
        if (!cashSession.isOpen) {
            alert("⚠️ La caja registradora está CERRADA. Por favor abre la caja en el módulo de 'Arqueo de Caja' (panel lateral derecho) antes de registrar el cobro de la mesa.");
            return;
        }

        // Update stats
        setOrdersSummary(prev => ({
            paid: { count: prev.paid.count + 1, total: prev.paid.total + total },
            pending: { count: Math.max(0, prev.pending.count - 1), total: Math.max(0, prev.pending.total - total) }
        }));

        setCashSession(prev => ({
            ...prev,
            salesInShift: prev.salesInShift + total
        }));

        // Add to charts
        if (waiterName) {
            setSalesByWaiter(prev => {
                const existing = prev.find(w => w.waiter_name === waiterName);
                if (existing) {
                    return prev.map(w => w.waiter_name === waiterName ? { ...w, total_sales: w.total_sales + total, orders_count: w.orders_count + 1 } : w);
                }
                return [...prev, { waiter_name: waiterName, total_sales: total, orders_count: 1 }];
            });
        }

        if (tableName) {
            setSalesByTable(prev => {
                const existing = prev.find(t => t.table_number === tableName);
                if (existing) {
                    return prev.map(t => t.table_number === tableName ? { ...t, total_sales: t.total_sales + total } : t);
                }
                return [...prev, { table_number: tableName, total_sales: total }];
            });
        }

        // Free Table
        setTables(tables.map(t => t.id === tableId ? { ...t, status: 'free', active_order: null, cart_data: null } : t));
        setActiveFlowStep(4);
    };

    const handleOpenCashDrawer = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(openingAmountInput) || 0;
        setCashSession({
            isOpen: true,
            openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            openingBalance: amt,
            salesInShift: 0
        });
    };

    const handleCloseCashDrawer = (e: React.FormEvent) => {
        e.preventDefault();
        const realAmt = parseFloat(closingRealAmountInput) || 0;
        const expected = cashSession.openingBalance + cashSession.salesInShift;
        const diff = realAmt - expected;

        const newReconciliation: CashReconciliation = {
            id: Date.now(),
            openedAt: cashSession.openedAt || '?',
            closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            openingBalance: cashSession.openingBalance,
            salesInShift: cashSession.salesInShift,
            expectedTotal: expected,
            realTotal: realAmt,
            difference: diff
        };

        setReconciliations([newReconciliation, ...reconciliations]);
        setCashSession({
            isOpen: false,
            openedAt: null,
            openingBalance: 0,
            salesInShift: 0
        });
        setClosingRealAmountInput('');
        setShowCloseDrawerModal(false);
    };

    // Release table
    const handleReleaseTable = (tableId: number) => {
        setTables(tables.map(t => t.id === tableId ? { ...t, status: 'free', active_order: null, cart_data: null } : t));
    };

    // Add table
    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableName) return;
        setTables([...tables, {
            id: Date.now(),
            number: newTableName,
            status: 'free',
            active_order: null,
            cart_data: null
        }]);
        setNewTableName('');
    };

    // Add product
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProdName || !newProdPrice) return;
        setProducts([...products, {
            id: Date.now(),
            name: newProdName,
            price: parseFloat(newProdPrice),
            category: newProdCategory,
            description: newProdDescription || 'Plato del día.'
        }]);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDescription('');
    };

    // Delete product
    const handleDeleteProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
    };

    // Waiter hiring
    const handleProcessWaiter = (id: number, status: 'hired' | 'rejected') => {
        setWaiters(waiters.map(w => w.id === id ? { ...w, status } : w));
    };

    const handleRateWaiter = (id: number, rating: number) => {
        setWaiters(waiters.map(w => w.id === id ? { ...w, rating } : w));
    };

    // Chart conversion
    const waiterChartData = salesByWaiter.map(item => ({
        name: item.waiter_name,
        ventas: Number(item.total_sales),
        pedidos: item.orders_count
    }));

    const tableChartData = salesByTable.map(item => ({
        name: item.table_number,
        value: Number(item.total_sales)
    }));

    return (
        <PublicLayout>
            <Head title="Admin Dashboard - bocado!" />
            
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 min-h-[85vh] text-slate-800 dark:text-gray-100">
                
                {/* Header Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-gray-900">
                    <Link
                        href="/simulator"
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-bold rounded-2xl text-xs transition-all flex items-center gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver al Hub</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">Simulando:</span>
                        <span className="px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                            💼 Propietario / Admin
                        </span>
                    </div>
                </div>
                {/* Owner Interactive Workflow Guide */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 p-6 rounded-[32px] shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3 gap-2">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
                                Flujo Completo del Propietario (Lógica de la Web)
                            </h3>
                            <p className="text-[11px] text-slate-400 font-semibold">Sigue los pasos secuenciales para simular el ciclo de vida del negocio desde cero.</p>
                        </div>
                        <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-xl font-black">
                            Paso {activeFlowStep} de 4
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Step 1 */}
                        <div 
                            onClick={() => setActiveFlowStep(1)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                activeFlowStep === 1 
                                    ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' 
                                    : 'border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    activeFlowStep === 1 ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                                }`}>
                                    1
                                </span>
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Registrar Mesa</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Registra las mesas de tu local para generar sus códigos QR automáticos.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div 
                            onClick={() => setActiveFlowStep(2)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                activeFlowStep === 2 
                                    ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' 
                                    : 'border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    activeFlowStep === 2 ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                                }`}>
                                    2
                                </span>
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Registrar Menú</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Configura la carta digital con precios y categorías para tus clientes.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div 
                            onClick={() => setActiveFlowStep(3)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                activeFlowStep === 3 
                                    ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' 
                                    : 'border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    activeFlowStep === 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                                }`}>
                                    3
                                </span>
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Simular Entrada</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Simula un cliente escaneando el QR y pidiendo comida en tiempo real.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div 
                            onClick={() => setActiveFlowStep(4)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                activeFlowStep === 4 
                                    ? 'bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20' 
                                    : 'border-slate-100 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    activeFlowStep === 4 ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                                }`}>
                                    4
                                </span>
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Cobros y Gráficos</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Registra los pagos de las cuentas y visualiza reportes de transacciones.
                            </p>
                        </div>
                    </div>

                    {/* Explanatory text */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-gray-800 rounded-2xl text-xs space-y-2">
                        {activeFlowStep === 1 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 1: Configurar las Mesas del Restaurante</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Dirígete a la sección <strong>"Registrar Ubicación"</strong> en la barra lateral derecha. Ingresa el nombre de una mesa (Ej. <code>Mesa 5</code>) y haz clic en "Agregar Mesa". 
                                    En el panel central <strong>"Monitoreo de Sala"</strong>, verás que cada mesa tiene su propio código QR. En la web real, este código QR se imprime y se pega físicamente en la mesa.
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 2 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 2: Registrar Productos en la Carta Digital</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Ve a la sección <strong>"Configurar Carta Digital"</strong>. Ingresa el nombre del producto, precio, categoría y descripción. Al agregarlo, el producto aparecerá inmediatamente en el menú que el cliente visualiza cuando escanea el código QR de su mesa.
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 3 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 3: Escaneo de QR y Toma de Pedidos</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Usa los botones de simulación a continuación: haz clic en <strong>"⚡ Simular Entrada"</strong> para recrear a un cliente que se sienta en una mesa libre, escanea el QR y envía un pedido a cocina. Verás cómo aparece la mesa en estado ocupado con su orden detallada.
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 4 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 4: Cobros, Métricas y Evaluación de Meseros</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Cuando el cliente termina de comer, solicita la cuenta (haz clic en <strong>"🛎️ Simular Cuenta"</strong>). La mesa cambiará a estado <strong>"Por Cobrar"</strong>. Haz clic en <strong>"Registrar Pago 💵"</strong> para archivar la venta. Esto actualizará los gráficos de ventas por mesero, ingresos históricos y ticket promedio al instante.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ALERT SOUND BAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-gray-800 p-4 px-6 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📢</span>
                        <div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">Simulación de Acciones de Clientes (Autopedidos QR)</h4>
                            <p className="text-[11px] text-slate-400 font-semibold">Simula la actividad de los clientes escaneando el código QR de sus mesas.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleSimulateCustomerArrival}
                            className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl transition-all flex items-center gap-1.5 shadow"
                        >
                            ⚡ Simular Entrada (QR Scan & Pedido)
                        </button>
                        <button
                            onClick={handleSimulateBillRequest}
                            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl transition-all flex items-center gap-1.5 shadow"
                        >
                            🛎️ Simular Cuenta (Pedir Factura)
                        </button>
                    </div>
                </div>

                {/* REAL TIME CLIENT REQUESTS BANNER */}
                {tables.some(t => t.cart_data && t.cart_data.length > 0 && !t.active_order) && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-blue-500/20 animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🛎️</span>
                            <div>
                                <h3 className="font-extrabold text-sm">Nuevas solicitudes de autopedidos QR</h3>
                                <p className="text-[11px] text-blue-100 font-medium">Hay mesas esperando aprobación de comanda por el administrador.</p>
                            </div>
                        </div>
                        <span className="bg-white text-blue-600 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm">
                            {tables.filter(t => t.cart_data && t.cart_data.length > 0 && !t.active_order).length} Mesa(s)
                        </span>
                    </div>
                )}

                {/* METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">📈</div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Ventas Totales</span>
                            <span className="text-base font-black text-slate-800 dark:text-white">{ordersSummary.paid.count}</span>
                        </div>
                    </div>
                    
                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">$</div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Ingreso Total</span>
                            <span className="text-base font-black text-slate-800 dark:text-white">${ordersSummary.paid.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-650 flex items-center justify-center font-bold text-sm">⭐</div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Ticket Promedio</span>
                            <span className="text-base font-black text-slate-800 dark:text-white">
                                ${(ordersSummary.paid.count > 0 ? ordersSummary.paid.total / ordersSummary.paid.count : 0).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">🪑</div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Ocupación</span>
                            <span className="text-base font-black text-slate-800 dark:text-white">
                                {occupiedTablesCount + pendingTablesCount} / {tables.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-sm">🛎️</div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Por Cobrar</span>
                            <span className="text-base font-black text-rose-600">${ordersSummary.pending.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* RECHARTS VISUALIZATIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Waiter stats bar chart */}
                    <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-gray-800 rounded-[32px] shadow-sm space-y-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Ventas por Mesero</h3>
                            <p className="text-[10px] text-slate-400">Total acumulado cobrado por el personal.</p>
                        </div>
                        
                        <div className="h-56 w-full text-[10px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={waiterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-gray-800" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip />
                                    <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
                                        {waiterChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table stats pie chart */}
                    <div className="p-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-gray-800 rounded-[32px] shadow-sm space-y-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Ingresos por Mesa</h3>
                            <p className="text-[10px] text-slate-400">Distribución de ingresos generados por ubicación.</p>
                        </div>

                        <div className="h-56 w-full flex items-center justify-center">
                            <div className="w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tableChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {tableChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-1.5 text-[10px]">
                                {tableChartData.slice(0, 4).map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                        <span className="font-semibold text-slate-700 dark:text-gray-300 truncate">{entry.name}</span>
                                        <span className="text-slate-400 font-bold">${entry.value.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTRAL MONITORING GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Active tables detail cards (8 columns) */}
                    <div className="lg:col-span-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <ChefHat className="w-5 h-5 text-orange-500" />
                            Monitoreo de Sala en Tiempo Real
                        </h3>

                        {tables.filter(t => t.status !== 'free' || (t.cart_data && t.cart_data.length > 0)).length === 0 ? (
                            <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px]">
                                <span className="text-3xl block">🏠</span>
                                <h4 className="text-sm font-black mt-3">¡Todas las mesas están libres!</h4>
                                <p className="text-xs text-slate-400 mt-1">No hay consumos activos ni autopedidos esperando.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {tables.filter(t => t.status !== 'free' || (t.cart_data && t.cart_data.length > 0)).map(table => (
                                    <div
                                        key={table.id}
                                        className={`p-6 bg-white dark:bg-slate-900 border rounded-[32px] shadow-sm flex flex-col justify-between space-y-4 ${
                                            table.cart_data && table.cart_data.length > 0 && !table.active_order
                                                ? 'border-blue-500 ring-2 ring-blue-500/10'
                                                : table.status === 'payment_pending'
                                                ? 'border-rose-500 ring-2 ring-rose-500/10'
                                                : 'border-slate-200 dark:border-gray-800'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-black text-sm">{table.number}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                    table.cart_data && table.cart_data.length > 0 && !table.active_order
                                                        ? 'bg-blue-500/15 text-blue-600'
                                                        : table.status === 'payment_pending'
                                                        ? 'bg-rose-500/15 text-rose-600'
                                                        : 'bg-amber-500/15 text-amber-600'
                                                }`}>
                                                    {table.cart_data && table.cart_data.length > 0 && !table.active_order
                                                        ? 'Autopedido QR'
                                                        : table.status === 'payment_pending'
                                                        ? 'Por Cobrar'
                                                        : 'Ocupada'}
                                                </span>
                                            </div>

                                            {table.active_order ? (
                                                <div className="space-y-2.5">
                                                    <span className="text-[10px] text-slate-400 block font-semibold">Atendido por: <span className="text-slate-700 dark:text-gray-300 font-bold">{table.active_order.waiter?.name}</span></span>
                                                    <div className="border-t border-b border-slate-100 dark:border-gray-800 py-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                        {table.active_order.items.map(item => (
                                                            <div key={item.id} className="flex justify-between text-[11px] leading-snug">
                                                                <div>
                                                                    <span className="font-black text-orange-600 dark:text-orange-400 mr-1.5">{item.quantity}x</span>
                                                                    <span className="font-semibold text-slate-700 dark:text-gray-200">{item.product.name}</span>
                                                                    {item.notes && <p className="text-[9px] text-slate-400 italic">Nota: {item.notes}</p>}
                                                                </div>
                                                                <span className="font-bold text-slate-500 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs pt-1 font-bold">
                                                        <span className="text-slate-400">Total acumulado:</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-white">${table.active_order.total_amount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ) : table.cart_data && table.cart_data.length > 0 ? (
                                                <div className="space-y-2.5">
                                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-semibold">Origen: Autopedido sin Aprobación</span>
                                                    <div className="border border-blue-500/10 bg-blue-500/5 py-2.5 px-3 rounded-2xl space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                        {table.cart_data.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-[11px] leading-snug">
                                                                <div>
                                                                    <span className="font-black text-blue-600 mr-1.5">{item.quantity}x</span>
                                                                    <span className="font-semibold text-slate-700 dark:text-gray-200">{item.name}</span>
                                                                </div>
                                                                <span className="font-bold text-slate-500 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs pt-1 font-bold">
                                                        <span className="text-slate-400">Total Solicitado:</span>
                                                        <span className="text-sm font-black text-blue-600">${table.cart_data.reduce((a,i)=>a+(i.price*i.quantity),0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-gray-800/80">
                                            {table.cart_data && table.cart_data.length > 0 && !table.active_order ? (
                                                <button
                                                    onClick={() => handleReleaseTable(table.id)}
                                                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-black rounded-xl text-[10px] transition-all"
                                                >
                                                    ❌ Rechazar y Descartar Pedido
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleReleaseTable(table.id)}
                                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-[10px] transition-all"
                                                    >
                                                        Liberar sin pago
                                                    </button>
                                                    <button
                                                        onClick={() => handlePay(table.id, table.active_order?.total_amount || 0, table.active_order?.waiter?.name, table.number)}
                                                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-[10px] transition-all shadow"
                                                    >
                                                        Registrar Pago 💵
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Panel configuration / waiter recruitment (4 columns) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Arqueo de Caja (Cash Reconciliation) Card */}
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px] space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Arqueo de Caja</h3>
                                    <p className="text-[10px] text-slate-400 font-semibold">Apertura, cierre y cuadre diario</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    cashSession.isOpen ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                                }`}>
                                    {cashSession.isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                                </span>
                            </div>

                            {cashSession.isOpen ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2.5 text-[11px] bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-slate-400 block">Saldo Apertura</span>
                                            <span className="font-extrabold text-slate-800 dark:text-white">${cashSession.openingBalance.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Ventas en Turno</span>
                                            <span className="font-extrabold text-green-600">${cashSession.salesInShift.toFixed(2)}</span>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex justify-between">
                                            <span className="text-slate-500 font-bold">Saldo Esperado:</span>
                                            <span className="font-black text-slate-800 dark:text-white">${(cashSession.openingBalance + cashSession.salesInShift).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {!showCloseDrawerModal ? (
                                        <button
                                            onClick={() => {
                                                setClosingRealAmountInput((cashSession.openingBalance + cashSession.salesInShift).toFixed(2));
                                                setShowCloseDrawerModal(true);
                                            }}
                                            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow"
                                        >
                                            🔒 Cerrar Caja y Arqueo
                                        </button>
                                    ) : (
                                        <form onSubmit={handleCloseCashDrawer} className="space-y-3 p-3 bg-red-500/5 border border-red-500/20 rounded-2xl animate-slide-up">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase">¿Cuánto Efectivo hay en Caja?</label>
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    value={closingRealAmountInput}
                                                    onChange={e => setClosingRealAmountInput(e.target.value)}
                                                    placeholder="Efectivo contado"
                                                    className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg transition-all"
                                                >
                                                    Confirmar Arqueo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCloseDrawerModal(false)}
                                                    className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-extrabold text-[10px] rounded-lg transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleOpenCashDrawer} className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Monto Inicial de Apertura</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            value={openingAmountInput}
                                            onChange={e => setOpeningAmountInput(e.target.value)}
                                            placeholder="Ej. 100.00"
                                            className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl transition-all shadow"
                                    >
                                        🔓 Abrir Caja Registradora
                                    </button>
                                </form>
                            )}

                            {/* Reconciliation History List */}
                            {reconciliations.length > 0 && (
                                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-gray-800">
                                    <span className="text-[9px] font-black text-slate-400 uppercase block">Historial de Cuadros (Arqueos)</span>
                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                        {reconciliations.map((rec) => (
                                            <div key={rec.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-gray-800/80 rounded-xl text-[10px] space-y-1 flex flex-col justify-between">
                                                <div className="flex justify-between font-bold text-slate-700 dark:text-gray-300">
                                                    <span>Turno ({rec.openedAt} - {rec.closedAt})</span>
                                                    <span className={rec.difference === 0 ? 'text-green-600' : rec.difference > 0 ? 'text-blue-600' : 'text-rose-600'}>
                                                        {rec.difference === 0 ? '✓ Cuadrado' : rec.difference > 0 ? `+${rec.difference.toFixed(2)}` : `${rec.difference.toFixed(2)}`}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 text-slate-400 text-[9px]">
                                                    <span>Ini: ${rec.openingBalance.toFixed(1)}</span>
                                                    <span>Vta: ${rec.salesInShift.toFixed(1)}</span>
                                                    <span>Real: ${rec.realTotal.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Table configuration */}
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px] space-y-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Registrar Ubicación</h3>
                                <p className="text-[10px] text-slate-400">Crear nuevas mesas en sala.</p>
                            </div>
                            
                            <form onSubmit={handleAddTable} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre de mesa (Ej. Mesa 5)"
                                    value={newTableName}
                                    onChange={e => setNewTableName(e.target.value)}
                                    className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow"
                                >
                                    Agregar Mesa
                                </button>
                            </form>
                        </div>

                        {/* Menu catalog configuration */}
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px] space-y-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Configurar Carta Digital</h3>
                                <p className="text-[10px] text-slate-400">Agregar platos rápidos.</p>
                            </div>

                            <form onSubmit={handleAddProduct} className="space-y-2.5">
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre: Ej. Pizza Hawaiana"
                                    value={newProdName}
                                    onChange={e => setNewProdName(e.target.value)}
                                    className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        placeholder="Precio: Ej. 14.00"
                                        value={newProdPrice}
                                        onChange={e => setNewProdPrice(e.target.value)}
                                        className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                    />
                                    <select
                                        value={newProdCategory}
                                        onChange={e => setNewProdCategory(e.target.value)}
                                        className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                    >
                                        <option value="Entradas">Entradas</option>
                                        <option value="Platos Fuertes">Fuertes</option>
                                        <option value="Bebidas">Bebidas</option>
                                        <option value="Postres">Postres</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Descripción corta"
                                    value={newProdDescription}
                                    onChange={e => setNewProdDescription(e.target.value)}
                                    className="w-full p-2 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow"
                                >
                                    Agregar Producto
                                </button>
                            </form>

                            {/* Menu listings */}
                            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                                {products.map(prod => (
                                    <div key={prod.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900/20 border border-slate-100 rounded-xl text-[10px]">
                                        <span className="font-bold text-slate-700 dark:text-white truncate max-w-[120px]">{prod.name}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-extrabold text-orange-600">${prod.price.toFixed(2)}</span>
                                            <button onClick={() => handleDeleteProduct(prod.id)} className="text-slate-400 hover:text-red-500 p-0.5">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* WAITSTAFF RECRUITMENT SECTION */}
                <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-gray-800 p-6 rounded-[32px] space-y-6 shadow-sm">
                    <div>
                        <h3 className="text-base font-black flex items-center gap-2">
                            <Award className="w-5 h-5 text-orange-500" />
                            Administración y Reclutamiento de Meseros
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Revisa postulaciones, contrata meseros y evalúa su desempeño en tiempo real.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {waiters.map(waiter => (
                            <div key={waiter.id} className="p-5 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xs font-black text-slate-800 dark:text-white">{waiter.name}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                            waiter.status === 'hired'
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : waiter.status === 'pending'
                                                ? 'bg-amber-500/10 text-amber-600'
                                                : 'bg-red-500/10 text-red-600'
                                        }`}>
                                            {waiter.status === 'hired' ? 'Contratado' : waiter.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Exp: {waiter.experience}</p>

                                    {/* Star Rating display & interact */}
                                    <div className="flex items-center gap-1 mt-2.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRateWaiter(waiter.id, star)}
                                                className={`p-0.5 transition-transform hover:scale-110 ${
                                                    star <= waiter.rating
                                                        ? 'text-amber-500'
                                                        : 'text-slate-300 dark:text-slate-700'
                                                }`}
                                            >
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                        ))}
                                        <span className="text-[10px] text-slate-500 dark:text-gray-400 ml-1 font-bold">({waiter.rating.toFixed(1)})</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {waiter.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleProcessWaiter(waiter.id, 'hired')}
                                                className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[9px] rounded-lg transition-all"
                                            >
                                                Contratar
                                            </button>
                                            <button
                                                onClick={() => handleProcessWaiter(waiter.id, 'rejected')}
                                                className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-extrabold text-[9px] rounded-lg transition-all"
                                            >
                                                Rechazar
                                            </button>
                                        </>
                                    )}
                                    {waiter.status === 'hired' && (
                                        <button
                                            onClick={() => handleProcessWaiter(waiter.id, 'rejected')}
                                            className="w-full py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-extrabold text-[9px] rounded-lg transition-all"
                                        >
                                            Despedir Mesero
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </PublicLayout>
    );
}
