import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Users, ArrowLeft, Play, Square, Trash2, Plus, Check, Bell, 
    Layers, AlertCircle, ChefHat, TrendingUp, Star, Award, Briefcase, Clock, Sun, Moon, LogOut, Coffee
} from 'lucide-react';

interface OrderItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    notes: string;
    status: 'preparing' | 'served';
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
    items: OrderItem[];
    total: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
}

export default function SimulatorWaiter() {
    // Mock database restaurant and tables
    const [linkedRestaurant, setLinkedRestaurant] = useState<string | null>(null);
    const [shiftActive, setShiftActive] = useState<boolean>(false);
    const [secondsWorked, setSecondsWorked] = useState<number>(0);
    const [activeFlowStep, setActiveFlowStep] = useState<number>(1);

    // Profile States
    const [phone, setPhone] = useState('+54 9 11 2345-6789');
    const [city, setCity] = useState('Buenos Aires');
    const [bio, setBio] = useState('Mesero proactivo y apasionado por la gastronomía.');
    const [skills, setSkills] = useState('Coctelería clásica, Servicio de vinos, Inglés intermedio');
    const [experience, setExperience] = useState('2 años en Trattoria Italiana');

    // Job search simulation
    const [hiringRestaurants, setHiringRestaurants] = useState([
        { id: 1, name: 'El Rinconcito Italiano', address: 'Av. Corrientes 1234', phone: '+54 11 4321-8765' },
        { id: 2, name: 'Pizzería Napolitana', address: 'Calle Florida 567', phone: '+54 11 4987-6543' }
    ]);
    const [applications, setApplications] = useState<Array<{ id: number; name: string; status: string }>>([]);
    const [jobOffers, setJobOffers] = useState([
        { id: 1, name: 'La Parrilla del Sol', address: 'Av. Libertador 4321', status: 'pending' }
    ]);

    // Active tables in the restaurant
    const initialTables: Table[] = [
        { id: 1, number: '1', status: 'free', total: 0, items: [], cart_data: null },
        { id: 2, number: '2', status: 'occupied', total: 18.00, items: [{ product_id: 1, name: 'Pizza Margarita', quantity: 1, price: 15.00, notes: '', status: 'preparing' }, { product_id: 4, name: 'Coca Cola', quantity: 1, price: 3.00, notes: 'Fria', status: 'served' }], cart_data: null },
        { id: 3, number: '3', status: 'occupied', total: 44.00, items: [{ product_id: 2, name: 'Lasagna Boloñesa', quantity: 2, price: 18.50, notes: '', status: 'preparing' }, { product_id: 5, name: 'Limonada Natural', quantity: 2, price: 3.50, notes: 'Poco dulce', status: 'preparing' }], cart_data: [{ product_id: 2, name: 'Lasagna Boloñesa', price: 18.50, quantity: 1, notes: 'Adicional' }] },
        { id: 4, number: '4', status: 'payment_pending', total: 21.50, items: [{ product_id: 3, name: 'Bruschetta de Tomate', quantity: 2, price: 8.00, notes: '', status: 'served' }, { product_id: 5, name: 'Limonada Natural', quantity: 1, price: 3.50, notes: '', status: 'served' }], cart_data: null }
    ];
    const [tables, setTables] = useState<Table[]>(initialTables);

    const demoProducts: Product[] = [
        { id: 1, name: 'Pizza Margarita', price: 15.00, category: 'Platos Fuertes', description: 'Mozzarella y albahaca.' },
        { id: 2, name: 'Lasagna Boloñesa', price: 18.50, category: 'Platos Fuertes', description: 'Carne y bechamel.' },
        { id: 3, name: 'Bruschetta de Tomate', price: 8.00, category: 'Entradas', description: 'Tomate, ajo y oliva.' },
        { id: 4, name: 'Coca Cola', price: 3.00, category: 'Bebidas', description: 'Refresco frío.' },
        { id: 5, name: 'Limonada Natural', price: 3.50, category: 'Bebidas', description: 'Limón exprimido.' },
        { id: 6, name: 'Tiramisú Clásico', price: 6.50, category: 'Postres', description: 'Mascarpone y café.' }
    ];

    // Navigation and Active View states
    const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
    const [orderCart, setOrderCart] = useState<OrderItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Platos Fuertes');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Performance Stats
    const [salesGenerated, setSalesGenerated] = useState(0);
    const [itemsServedCount, setItemsServedCount] = useState(0);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [finalSummary, setFinalSummary] = useState<any>(null);

    useEffect(() => {
        let interval: any;
        if (shiftActive) {
            interval = setInterval(() => {
                setSecondsWorked(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [shiftActive]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Apply to restaurant
    const handleApply = (restId: number, restName: string) => {
        setApplications([...applications, { id: restId, name: restName, status: 'pending' }]);
    };

    // Accept Job offer
    const handleAcceptOffer = (offerId: number, restName: string) => {
        setLinkedRestaurant(restName);
        setJobOffers(jobOffers.filter(o => o.id !== offerId));
        setActiveFlowStep(2); // Progress to shift activation
    };

    // Resign/Unlink
    const handleResign = () => {
        setLinkedRestaurant(null);
        setShiftActive(false);
        setSelectedTableForOrder(null);
        setActiveFlowStep(1);
    };

    // Shift controls
    const handleStartShift = () => {
        setShiftActive(true);
        setSecondsWorked(0);
        setSalesGenerated(0);
        setItemsServedCount(0);
        setShowSummaryModal(false);
        setActiveFlowStep(3); // Progress to tables management
    };

    const handleEndShift = () => {
        const tips = salesGenerated * 0.10;
        const rating = 4.2 + Math.random() * 0.8;
        
        setFinalSummary({
            timeWorked: formatTime(secondsWorked),
            itemsServed: itemsServedCount,
            sales: salesGenerated,
            tips: tips.toFixed(2),
            rating: rating.toFixed(1)
        });

        setShiftActive(false);
        setShowSummaryModal(true);
        setActiveFlowStep(4);
    };

    // Open Order Sheet for table
    const handleOpenOrderSheet = (table: Table) => {
        setSelectedTableForOrder(table);
        setOrderCart(table.items);
    };

    // Order Sheet Cart actions
    const addToCart = (product: Product) => {
        const existing = orderCart.find(item => item.product_id === product.id && item.status === 'preparing');
        if (existing) {
            setOrderCart(orderCart.map(item => 
                item.product_id === product.id && item.status === 'preparing'
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setOrderCart([...orderCart, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                notes: '',
                status: 'preparing'
            }]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setOrderCart(orderCart.map(item => {
            if (item.product_id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean) as OrderItem[]);
    };

    const updateNotes = (productId: number, notes: string) => {
        setOrderCart(orderCart.map(item => 
            item.product_id === productId ? { ...item, notes } : item
        ));
    };

    const handleSetItemServed = (itemIndex: number) => {
        const updated = orderCart.map((item, idx) => {
            if (idx === itemIndex) {
                setItemsServedCount(prev => prev + item.quantity);
                return { ...item, status: 'served' as const };
            }
            return item;
        });
        setOrderCart(updated);
    };

    // Clear client Cart requested
    const handleClearClientCart = (tableId: number) => {
        setTables(tables.map(t => t.id === tableId ? { ...t, cart_data: null } : t));
        if (selectedTableForOrder && selectedTableForOrder.id === tableId) {
            setSelectedTableForOrder({ ...selectedTableForOrder, cart_data: null });
        }
    };

    // Approve client Cart requested
    const handleApproveClientCart = (table: Table) => {
        let updatedCart = [...orderCart];
        table.cart_data?.forEach(clientItem => {
            const existingIdx = updatedCart.findIndex(item => item.product_id === clientItem.product_id && item.status === 'preparing');
            if (existingIdx > -1) {
                updatedCart[existingIdx].quantity += clientItem.quantity;
            } else {
                updatedCart.push({
                    product_id: clientItem.product_id,
                    name: clientItem.name,
                    price: clientItem.price,
                    quantity: clientItem.quantity,
                    notes: clientItem.notes || '',
                    status: 'preparing'
                });
            }
        });
        setOrderCart(updatedCart);
        handleClearClientCart(table.id);
    };

    // Save active order sheet back to tables state
    const handleSaveOrder = () => {
        if (!selectedTableForOrder) return;
        const total = orderCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        setTables(tables.map(t => 
            t.id === selectedTableForOrder.id
                ? { ...t, items: orderCart, total, status: orderCart.length > 0 ? 'occupied' : 'free' }
                : t
        ));
        setSelectedTableForOrder(null);
    };

    // Process payments (quick billing)
    const handlePayTable = (tableId: number, total: number) => {
        setSalesGenerated(prev => prev + total);
        setTables(tables.map(t => 
            t.id === tableId 
                ? { ...t, items: [], total: 0, status: 'free' as const, cart_data: null }
                : t
        ));
        if (selectedTableForOrder && selectedTableForOrder.id === tableId) {
            setSelectedTableForOrder(null);
        }
    };

    // Release table
    const handleReleaseTable = (tableId: number) => {
        setTables(tables.map(t => 
            t.id === tableId 
                ? { ...t, items: [], total: 0, status: 'free' as const, cart_data: null }
                : t
        ));
        if (selectedTableForOrder && selectedTableForOrder.id === tableId) {
            setSelectedTableForOrder(null);
        }
    };

    const handleRequestPayment = (tableId: number) => {
        setTables(tables.map(t => 
            t.id === tableId ? { ...t, status: 'payment_pending' as const } : t
        ));
        if (selectedTableForOrder && selectedTableForOrder.id === tableId) {
            setSelectedTableForOrder({ ...selectedTableForOrder, status: 'payment_pending' });
        }
    };

    // Filter products in OrderSheet
    const filteredProducts = demoProducts.filter(p => {
        const matchesCategory = p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <PublicLayout>
            <Head title="Terminal de Mesero - bocado!" />
            
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-8 min-h-[85vh] text-slate-800 dark:text-gray-100">
                
                {/* 0. Header navigation */}
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
                            🧑‍🍳 Mesero
                        </span>
                    </div>
                </div>

                {/* FLOWSTEP GUIDELINES */}
                <div className="bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-gray-800 p-5 rounded-[28px] space-y-3">
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider block">Flujo de simulación del mesero</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {[
                            { step: 1, title: '1. Buscar Trabajo', desc: 'Regístrate y aplica a locales' },
                            { step: 2, title: '2. Iniciar Turno', desc: 'Hacer ponche de entrada' },
                            { step: 3, title: '3. Gestionar Comandas', desc: 'Atender y servir platos' },
                            { step: 4, title: '4. Resumen Final', desc: 'Auditar caja y propinas' }
                        ].map(flow => (
                            <div
                                key={flow.step}
                                className={`p-3 rounded-2xl border text-left ${
                                    activeFlowStep === flow.step
                                        ? 'border-orange-500 bg-orange-500/5'
                                        : 'border-slate-100 dark:border-gray-800 opacity-60'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase block">{flow.title}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">{flow.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ========================================================
                    STATE 1: WAITER HAS NO RESTAURANT (UNLINKED)
                   ======================================================== */}
                {!linkedRestaurant && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Skills and Contact Profile Card */}
                            <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-gray-800 rounded-[32px] space-y-4">
                                <div>
                                    <h3 className="text-base font-black">Ajustes de Perfil del Talento</h3>
                                    <p className="text-xs text-slate-400 dark:text-gray-500">Configura tu perfil para recibir propuestas de contratación.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Celular de Contacto</label>
                                        <input 
                                            type="text" 
                                            value={phone} 
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Ciudad</label>
                                        <input 
                                            type="text" 
                                            value={city} 
                                            onChange={e => setCity(e.target.value)}
                                            className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Especialidades / Habilidades</label>
                                        <input 
                                            type="text" 
                                            value={skills} 
                                            onChange={e => setSkills(e.target.value)}
                                            className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Biografía / Presentación</label>
                                        <textarea 
                                            value={bio} 
                                            onChange={e => setBio(e.target.value)}
                                            rows={2}
                                            className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Job Offers Received (Invitation to Join) */}
                            <div className="p-6 bg-white dark:bg-slate-900/35 border-2 border-orange-500/20 rounded-[32px] space-y-4 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h3 className="text-base font-black flex items-center gap-1.5">
                                        <span>📩</span> Ofertas Recibidas
                                    </h3>
                                    <p className="text-xs text-slate-400">Restaurantes que te han invitado a unirte a su personal.</p>
                                    
                                    {jobOffers.map(offer => (
                                        <div key={offer.id} className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 space-y-2">
                                            <span className="text-xs font-black block text-slate-800 dark:text-white">{offer.name}</span>
                                            <span className="text-[10px] text-slate-400 block">📍 {offer.address}</span>
                                            <div className="flex gap-2 pt-2 border-t border-slate-200/40 dark:border-gray-800/60">
                                                <button
                                                    onClick={() => setJobOffers([])}
                                                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-[10px] font-bold rounded-lg transition-all"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptOffer(offer.id, offer.name)}
                                                    className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold rounded-lg transition-all"
                                                >
                                                    Aceptar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Local Restaurants Hiring Board */}
                        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-gray-800 p-6 rounded-[32px] space-y-4">
                            <div>
                                <h3 className="text-base font-black">Bolsa de Empleo (Locales Buscando Personal)</h3>
                                <p className="text-xs text-slate-400">Aplica a restaurantes activos en la plataforma para empezar a trabajar con ellos.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hiringRestaurants.map(rest => {
                                    const applied = applications.some(a => a.id === rest.id);
                                    return (
                                        <div key={rest.id} className="p-5 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-200/50 dark:border-gray-800 flex justify-between items-center">
                                            <div>
                                                <span className="font-black text-sm text-slate-800 dark:text-white block">{rest.name}</span>
                                                <span className="text-[10px] text-slate-400 block mt-1">📍 {rest.address} | 📞 {rest.phone}</span>
                                            </div>
                                            <button
                                                onClick={() => handleApply(rest.id, rest.name)}
                                                disabled={applied}
                                                className={`py-2 px-4 rounded-xl text-xs font-black transition-all ${
                                                    applied 
                                                        ? 'bg-slate-200 text-slate-400 dark:bg-slate-800'
                                                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow'
                                                }`}
                                            >
                                                {applied ? 'Postulado' : 'Postularse'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    STATE 2: VINCULATED RESTAURANT, SHIFT INACTIVE
                   ======================================================== */}
                {linkedRestaurant && !shiftActive && !showSummaryModal && (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-gray-800 rounded-[32px] max-w-lg mx-auto space-y-6 animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-3xl">
                            ☕
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">{linkedRestaurant}</h3>
                            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                                Estás vinculado a la plantilla de meseros de este restaurante. Debes iniciar turno en el reloj de arriba para tomar comisiones y comandas.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full max-w-xs">
                            <button
                                onClick={handleStartShift}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-xs shadow transition-all"
                            >
                                Iniciar Turno de Trabajo ⚡
                            </button>
                            <button
                                onClick={handleResign}
                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-extrabold text-[10px] rounded-2xl transition-all"
                            >
                                Renunciar / Desvincularse
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    STATE 3: SHIFT ACTIVE (MAIN WAITSTAFF TERMINAL)
                   ======================================================== */}
                {linkedRestaurant && shiftActive && !selectedTableForOrder && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Real-time client request banner */}
                        {tables.some(t => t.cart_data && t.cart_data.length > 0) && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] p-5 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-blue-500/20 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🛎️</span>
                                    <div>
                                        <h3 className="font-extrabold text-xs">Llamados de Clientes en Tiempo Real</h3>
                                        <p className="text-[10px] text-blue-100 font-medium">Hay mesas solicitando atención en la carta digital.</p>
                                    </div>
                                </div>
                                <span className="bg-white text-blue-600 px-3 py-1 rounded-xl text-[10px] font-black">
                                    {tables.filter(t => t.cart_data && t.cart_data.length > 0).length} Mesa(s)
                                </span>
                            </div>
                        )}

                        {/* Room Statistics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <span className="text-lg">🪑</span>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Mesas</span>
                                    <span className="text-sm font-black">{tables.length}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <span className="text-lg">🟢</span>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Libres</span>
                                    <span className="text-sm font-black">{tables.filter(t => t.status === 'free').length}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <span className="text-lg">🟡</span>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Ocupadas</span>
                                    <span className="text-sm font-black">{tables.filter(t => t.status === 'occupied').length}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex items-center gap-3">
                                <span className="text-lg">🛎️</span>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Piden Cuenta</span>
                                    <span className="text-sm font-black">{tables.filter(t => t.status === 'payment_pending').length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Tables list (Clicking opens order sheet) */}
                        <div className="bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-gray-800 p-6 rounded-[32px] space-y-4">
                            <div>
                                <h3 className="text-base font-black">Mesas del Local ({linkedRestaurant})</h3>
                                <p className="text-xs text-slate-400">Haz clic sobre cualquier mesa para abrir su planilla, registrar comandas o procesar cobros.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {tables.map(table => (
                                    <div
                                        key={table.id}
                                        onClick={() => handleOpenOrderSheet(table)}
                                        className="p-5 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-gray-800 rounded-3xl hover:border-orange-500/25 hover:shadow transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-black text-slate-800 dark:text-white group-hover:text-orange-500">Mesa {table.number}</span>
                                                {table.cart_data && table.cart_data.length > 0 && (
                                                    <span className="block text-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black px-1.5 py-0.5 rounded-full mt-1.5 w-max animate-pulse">🛎️ Asistencia</span>
                                                )}
                                            </div>
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                table.status === 'free'
                                                    ? 'bg-green-500'
                                                    : table.status === 'occupied'
                                                    ? 'bg-amber-500'
                                                    : 'bg-rose-500'
                                            }`} />
                                        </div>

                                        <div className="flex justify-between items-end border-t border-slate-200/50 dark:border-gray-800 pt-2 text-[10px]">
                                            <span className="text-slate-400 font-bold uppercase">{table.status === 'free' ? 'Libre' : 'Ventas'}</span>
                                            <span className="font-black text-slate-800 dark:text-white">${table.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* End shift actions block */}
                        <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-900/30 rounded-[24px] border border-slate-100">
                            <span className="text-xs text-slate-400 font-medium">¿Completaste tu jornada? Haz ponche de salida para auditar tu desempeño.</span>
                            <button
                                onClick={handleEndShift}
                                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-extrabold rounded-xl transition-all"
                            >
                                Finalizar Turno
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================
                    STATE 3B: ORDER SHEET PANEL (SIMULATED DOCK VIEW)
                   ======================================================== */}
                {selectedTableForOrder && (
                    <div className="flex-1 flex flex-col lg:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px] overflow-hidden min-h-[550px] animate-fade-in shadow-xl">
                        
                        {/* LEFT: CART/SELECTED ITEMS SHEET (50% WIDTH) */}
                        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900/20 lg:overflow-y-auto">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-2">
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Detalles de la Comanda</h3>
                                    <button 
                                        onClick={() => setSelectedTableForOrder(null)}
                                        className="p-1 text-slate-400 hover:text-slate-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Active Customer Request Alert */}
                                {selectedTableForOrder.cart_data && selectedTableForOrder.cart_data.length > 0 && (
                                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <span className="p-2 bg-amber-500/20 rounded-xl text-lg animate-pulse">🛎️</span>
                                            <div>
                                                <h4 className="font-extrabold text-amber-800 dark:text-amber-400 text-xs">Llamado de Mesa {selectedTableForOrder.number}</h4>
                                                <p className="text-[10px] text-slate-400 font-semibold leading-normal">El cliente ha solicitado un plato o asistencia desde su carta digital.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-amber-500/10">
                                            <button
                                                onClick={() => handleApproveClientCart(selectedTableForOrder)}
                                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all"
                                            >
                                                Aceptar Pedido
                                            </button>
                                            <button
                                                onClick={() => handleClearClientCart(selectedTableForOrder.id)}
                                                className="py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-[10px] font-black rounded-lg transition-all"
                                            >
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ordered items list */}
                                {orderCart.length === 0 ? (
                                    <div className="py-20 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-gray-800 rounded-2xl p-6">
                                        <span className="text-4xl block animate-pulse">📥</span>
                                        <span className="text-xs font-black text-slate-700 dark:text-white mt-3 block">Comanda Vacía</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">Añade productos de la carta seleccionándolos a la derecha.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orderCart.map((item, idx) => (
                                            <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl flex flex-col gap-2.5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{item.name}</h4>
                                                        <span className="text-[10px] text-orange-600 font-bold block mt-0.5">${item.price.toFixed(2)} c/u</span>
                                                    </div>
                                                    <span className="text-xs font-black">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Notas del comensal (Ej. sin cebolla)"
                                                        value={item.notes}
                                                        onChange={e => updateNotes(item.product_id, e.target.value)}
                                                        className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] focus:outline-none text-slate-800 dark:text-white"
                                                    />
                                                    
                                                    {/* Quantity control */}
                                                    <div className="flex items-center border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1">
                                                        <button 
                                                            onClick={() => updateQuantity(item.product_id, -1)}
                                                            className="w-6 h-6 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center font-black text-[10px]"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-6 text-center text-[10px] font-bold">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.product_id, 1)}
                                                            className="w-6 h-6 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center font-black text-[10px]"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Kitchen/Preparing and deliver states */}
                                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200/60 dark:border-gray-800/60">
                                                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${
                                                        item.status === 'preparing' ? 'text-amber-600' : 'text-green-600'
                                                    }`}>
                                                        {item.status === 'preparing' && <><ChefHat className="w-3.5 h-3.5 animate-bounce" /> Cocinando...</>}
                                                        {item.status === 'served' && <><Check className="w-3.5 h-3.5" /> Entregado a mesa</>}
                                                    </span>

                                                    {item.status === 'preparing' && (
                                                        <button
                                                            onClick={() => handleSetItemServed(idx)}
                                                            className="py-1 px-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[9px] rounded-lg transition-all"
                                                        >
                                                            Servir Plato 🍽️
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sticky billing values and save action */}
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-800 flex flex-col gap-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Comanda</span>
                                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">${orderCart.reduce((sum, item)=>sum+(item.price*item.quantity), 0).toFixed(2)}</span>
                                </div>

                                <div className="flex gap-2">
                                    {selectedTableForOrder.status !== 'free' && (
                                        <>
                                            <button
                                                onClick={() => handleReleaseTable(selectedTableForOrder.id)}
                                                className="flex-1 py-2.5 bg-slate-200 hover:bg-red-500/10 hover:text-red-600 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-extrabold text-[10px] rounded-xl transition-all"
                                            >
                                                Cancelar Mesa
                                            </button>
                                            <button
                                                onClick={() => handlePayTable(selectedTableForOrder.id, selectedTableForOrder.total)}
                                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-xl transition-all shadow"
                                            >
                                                Cobrar 💵
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleSaveOrder}
                                        className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] rounded-xl transition-all shadow"
                                    >
                                        💾 Guardar Pedido
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: PRODUCTS MENU PANEL (50% WIDTH) */}
                        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between lg:overflow-hidden bg-white dark:bg-slate-900">
                            <div className="flex-1 flex flex-col lg:overflow-hidden space-y-4">
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Buscar plato o bebida..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full p-2.5 border border-slate-200 dark:border-gray-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white"
                                    />

                                    <div className="flex overflow-x-auto gap-2 pb-1">
                                        {['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                                    selectedCategory === cat
                                                        ? 'bg-orange-600 text-white shadow'
                                                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-gray-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Menu Catalog List */}
                                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[350px] lg:max-h-none pt-2 border-t border-slate-100 dark:border-gray-800/60">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-gray-800 hover:border-orange-500/40 cursor-pointer flex flex-col justify-between transition-all h-28"
                                        >
                                            <div>
                                                <h4 className="font-extrabold text-[11px] text-slate-900 dark:text-white leading-tight line-clamp-2">{product.name}</h4>
                                                <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-black text-orange-600 dark:text-orange-400 text-[10px]">${product.price.toFixed(2)}</span>
                                                <span className="text-[8px] bg-orange-500/10 text-orange-600 font-extrabold px-1.5 py-0.5 rounded-lg">+ Añadir</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================
                    STATE 4: SUMMARY PERFORMANCE MODAL / CARD
                   ======================================================== */}
                {showSummaryModal && finalSummary && (
                    <div className="p-8 bg-gradient-to-r from-emerald-500/5 via-green-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-[32px] shadow-xl space-y-6 max-w-2xl mx-auto animate-fade-in text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                            🎉
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Resumen del Turno Finalizado</h3>
                            <p className="text-xs text-slate-400">Excelente labor. Aquí están tus comisiones y estadísticas acumuladas:</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/15">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Tiempo</span>
                                <span className="text-xs font-black text-slate-800 dark:text-white block mt-1">{finalSummary.timeWorked}</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/15">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Entregas</span>
                                <span className="text-xs font-black text-slate-800 dark:text-white block mt-1">{finalSummary.itemsServed} platos</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/15">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Venta Total</span>
                                <span className="text-xs font-black text-emerald-600 block mt-1">${finalSummary.sales.toFixed(2)}</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/15">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Propinas (10%)</span>
                                <span className="text-xs font-black text-orange-600 block mt-1">${finalSummary.tips}</span>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/15 col-span-2 sm:col-span-1">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase">Calificación</span>
                                <span className="text-xs font-black text-amber-500 block mt-1 flex items-center justify-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {finalSummary.rating}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200/50">
                            <button
                                onClick={() => {
                                    setShowSummaryModal(false);
                                    setFinalSummary(null);
                                    setActiveFlowStep(1);
                                }}
                                className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow"
                            >
                                Iniciar Nueva Simulación
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </PublicLayout>
    );
}
const X = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
