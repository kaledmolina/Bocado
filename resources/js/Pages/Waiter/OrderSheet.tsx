import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, X } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import Toast from '@/Components/Toast';
import PaymentModal from '@/Components/PaymentModal';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string;
    is_available: boolean;
    image_path?: string | null;
}

interface OrderItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    notes: string;
}

interface Table {
    id: number;
    number: string;
    status: string;
    qr_code_token?: string;
    is_active_for_order?: boolean;
    temp_pin?: string | null;
    pin_requested?: boolean;
    cart_data?: Array<{
        id: string;
        customer_name: string;
        created_at: string;
        items: Array<{
            product_id: number;
            name: string;
            price: number;
            quantity: number;
            notes: string;
        }>;
    }> | null;
}

interface ActiveOrder {
    id: number;
    customer_name: string | null;
    total_amount: number;
    items: Array<{
        id: number;
        product_id: number;
        quantity: number;
        price: number;
        notes: string | null;
        product: {
            name: string;
        }
    }>;
}

interface Props {
    table: Table;
    products: Product[];
    activeOrders: ActiveOrder[];
    restaurant: {
        waiters_can_collect_payment: boolean;
    };
}

const DEFAULT_CATEGORIES = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres'];

export default function OrderSheet({ table, products, activeOrders = [], restaurant }: Props) {
    const { flash } = usePage().props as any;
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const customCategories = Array.from(new Set(products.map(p => p.category)))
        .filter(cat => !DEFAULT_CATEGORIES.includes(cat));
    const CATEGORIES = [...DEFAULT_CATEGORIES, ...customCategories];

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
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

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Polling and chime synthesis for client requests

    const [audioEnabled, setAudioEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('audio_notifications');
            return stored === null ? true : stored === 'true';
        }
        return true;
    });

    const audioContextRef = useRef<AudioContext | null>(null);

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
    useEffect(() => {
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

    const isFirstRender = useRef(true);
    const prevCartDataStr = useRef<string>('');

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['table'],
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const currentCartStr = table.cart_data
            ? table.cart_data.map(req => req.id).join(',')
            : '';

        if (isFirstRender.current) {
            prevCartDataStr.current = currentCartStr;
            isFirstRender.current = false;
            return;
        }

        if (currentCartStr !== '' && currentCartStr !== prevCartDataStr.current) {
            playNotificationSound();
        }
        prevCartDataStr.current = currentCartStr;
    }, [table.cart_data]);

    const [selectedCategory, setSelectedCategory] = useState<string>('Platos Fuertes');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [cart, setCart] = useState<OrderItem[]>([]);

    const [customerName, setCustomerName] = useState<string>('General');

    // Cart is always empty initially, ready for a new order
    useEffect(() => {
        setCart([]);
    }, [table.id]);

    const { data, setData, post, processing } = useForm({
        customer_name: customerName,
        items: [] as any[],
        request_id: ''
    });

    // Update form data whenever cart or name changes
    useEffect(() => {
        setData(data => ({
            ...data,
            customer_name: customerName,
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                notes: item.notes,
            }))
        }));
    }, [cart, customerName]);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                notes: '',
            }]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean) as OrderItem[]);
    };

    const updateNotes = (productId: number, notes: string) => {
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, notes } : item
        ));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('waiter.order.save', table.id), {
            preserveScroll: true,
            onSuccess: () => {
                setCart([]);
                setCustomerName('General');
            }
        });
    };

    const handleRequestPayment = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Pedir Cuenta',
            message: '¿Confirmar que esta mesa está pidiendo la cuenta?',
            confirmLabel: 'Pedir Cuenta',
            onConfirm: () => {
                router.post(route('waiter.order.request-payment', table.id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: false,
        });
    };

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        totalAmount: number;
        orderId?: number;
        order?: any;
    }>({
        isOpen: false,
        totalAmount: 0,
    });

    const handlePayAll = () => {
        const total = activeOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        if (total === 0 && activeOrders.length === 0) {
            setToast({ message: 'No hay pedidos activos para cobrar.', type: 'error' });
            return;
        }
        setPaymentModal({
            isOpen: true,
            totalAmount: total,
            orderId: undefined
        });
    };

    const handlePayOrder = (order: ActiveOrder) => {
        setPaymentModal({
            isOpen: true,
            totalAmount: Number(order.total_amount),
            orderId: order.id,
            order: order,
        });
    };

    const handleConfirmPayment = (receivedAmount: number, changeAmount: number) => {
        router.post(route('tables.pay', table.id), {
            received_amount: receivedAmount,
            change_amount: changeAmount,
            order_id: paymentModal.orderId,
        }, {
            onFinish: () => {
                setPaymentModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleRelease = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Liberar Mesa',
            message: '¿Estás seguro de liberar esta mesa sin registrar pago? El pedido activo se cancelará.',
            confirmLabel: 'Liberar Mesa',
            onConfirm: () => {
                router.post(route('tables.release', table.id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    // Client requested cart actions
    const handleClearClientCart = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Descartar Pedido',
            message: '¿Deseas descartar y limpiar el pedido solicitado por el cliente?',
            confirmLabel: 'Descartar',
            onConfirm: () => {
                router.post(route('tables.clear-client-cart', table.id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    const handleApproveClientCart = (requestId: string, clientName: string, clientItems: any[]) => {
        // Create an order specifically for this request.
        // It populates the form and sends it.
        setData(data => ({
            ...data,
            customer_name: clientName,
            request_id: requestId,
            items: clientItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                notes: item.notes,
            }))
        }));

        // Give React a moment to update the data state, then submit
        setTimeout(() => {
            post(route('waiter.order.save', table.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setToast({ message: `Pedido de ${clientName} aprobado`, type: 'success' });
                    setCart([]);
                    setCustomerName('General');
                    // Reset form
                    setData(data => ({
                        ...data,
                        customer_name: 'General',
                        request_id: '',
                        items: []
                    }));
                }
            });
        }, 50);
    };

    const handleRemoveClientRequest = (requestId: string) => {
        if (!table.cart_data) return;
        const updatedRequests = table.cart_data.filter(req => req.id !== requestId);
        
        if (updatedRequests.length === 0) {
            router.post(route('tables.clear-client-cart', table.id));
        } else {
            router.post(route('qr.request-order', table.qr_code_token || ''), {
                items: updatedRequests // Actually the endpoint expects items as products if we overwrite... Wait, we can't overwrite cart_data directly from OrderSheet unless we add an endpoint.
                // Let's use a new endpoint or pass action 'remove_request'.
                // I will add a parameter to clear-client-cart.
            });
        }
    };

    const handleRejectRequest = (requestId: string) => {
        router.post(route('tables.clear-client-cart', table.id), {
            request_id: requestId
        }, { preserveScroll: true });
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesCategory = p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-150 flex flex-col font-sans transition-colors duration-250">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <Head title={`Tomar Pedido - ${table.number}`} />
            
            {/* Mobile Sticky Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/80 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
                <Link
                    href={route('waiter.dashboard')}
                    className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-1.5 font-black text-[11px] bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all active:scale-95 shadow-sm"
                >
                    Volver
                </Link>
                
                <div className="text-center flex flex-col items-center gap-1.5">
                    <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                        {table.number.toLowerCase().includes('mesa') ? table.number : `Mesa ${table.number}`}
                    </h1>
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            table.status === 'free'
                                ? 'bg-emerald-100 dark:bg-emerald-955 text-emerald-700 dark:text-emerald-450'
                                : table.status === 'occupied'
                                ? 'bg-amber-100 dark:bg-amber-955 text-amber-700 dark:text-amber-450'
                                : 'bg-rose-100 dark:bg-rose-955 text-rose-700 dark:text-rose-455'
                        }`}>
                            {table.status === 'free' ? 'Libre' : table.status === 'occupied' ? 'Ocupada' : 'Por Cobrar'}
                        </span>
                        {table.temp_pin && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-955 text-indigo-700 dark:text-indigo-400">
                                PIN: {table.temp_pin}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={toggleAudio}
                        type="button"
                        className={`px-3 py-2 flex items-center gap-1.5 font-black text-[11px] rounded-2xl transition-all hover:scale-105 active:scale-95 border cursor-pointer ${
                            audioEnabled
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 border-emerald-500/20 shadow-sm'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
                        }`}
                        title={audioEnabled ? "Desactivar sonido" : "Activar sonido de notificaciones"}
                    >
                        <span>{audioEnabled ? "🔔" : "🔕"}</span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Cambiar tema"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-500" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-550" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main scrollable body */}
            <div className="flex-1 flex flex-col lg:flex-row lg:h-[calc(100vh-68px)] lg:overflow-hidden">
                
                {/* Cart / Selected Items Panel */}
                <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200/80 dark:border-gray-850 lg:overflow-y-auto bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800 pb-2">
                            <h2 className="text-sm font-black uppercase tracking-wider text-gray-450 dark:text-gray-500">
                                Nuevo Pedido
                            </h2>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">A nombre de:</span>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none dark:text-white"
                                placeholder="General"
                            />
                        </div>

                        {/* PIN Solicitado por Cliente */}
                        {table.pin_requested && (
                            <div className="bg-indigo-500/10 border border-indigo-500/25 dark:border-indigo-500/35 rounded-3xl p-5 shadow-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="p-2 bg-indigo-500/20 rounded-2xl animate-pulse text-lg">
                                            🔑
                                        </span>
                                        <div>
                                            <h3 className="font-extrabold text-indigo-800 dark:text-indigo-400 text-xs">PIN Solicitado</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">El cliente solicita el PIN para realizar un pedido.</p>
                                        </div>
                                    </div>
                                    {table.temp_pin && (
                                        <div className="bg-indigo-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-sm">
                                            {table.temp_pin}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-indigo-500/10">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            router.post(route('tables.clear-client-cart', table.id));
                                        }}
                                        className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-2xl text-[10px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        🔑 Marcar PIN como Entregado
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pedido Solicitado por Cliente (Pending Approval) */}
                        {table.cart_data && table.cart_data.length > 0 && (
                            <div className="space-y-4">
                                {table.cart_data.map((request, reqIdx) => {
                                    const isCallWaiter = request.items.length === 1 && request.items[0].product_id === 0;

                                    return (
                                        <div key={request.id || reqIdx} className={`${isCallWaiter ? 'bg-amber-500/10 border-amber-500/25 dark:border-amber-500/35' : 'bg-blue-500/10 border-blue-500/25 dark:border-blue-500/35'} border rounded-3xl p-5 shadow-sm space-y-3`}>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/10">
                                                <div className="flex items-center gap-2">
                                                    <span className={`p-2 rounded-2xl animate-pulse ${isCallWaiter ? 'bg-amber-500/20' : 'bg-blue-500/20 text-base'}`}>
                                                        {isCallWaiter ? '🛎️' : '📲'}
                                                    </span>
                                                    <div>
                                                        <h3 className={`font-extrabold text-xs ${isCallWaiter ? 'text-amber-800 dark:text-amber-400' : 'text-blue-800 dark:text-blue-400'}`}>
                                                            {isCallWaiter ? 'Llamado al Mesero' : 'Autopedido QR'}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                                                            A nombre de: <span className="font-bold text-gray-700 dark:text-gray-300">{request.customer_name}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isCallWaiter && (
                                                <div className="space-y-2 py-1 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                                                    {request.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-start text-[11px] bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-150/40 dark:border-gray-800/40">
                                                            <div>
                                                                <span className="font-extrabold text-blue-600 dark:text-blue-400 mr-1.5">{item.quantity}x</span>
                                                                <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                                                                {item.notes && (
                                                                    <span className="block text-[9px] text-gray-400 italic mt-0.5">Nota: {item.notes}</span>
                                                                )}
                                                            </div>
                                                            <span className="font-extrabold text-gray-700 dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2.5 pt-2 border-t border-gray-200/10">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    className={`flex-1 py-2.5 px-3 font-bold border rounded-2xl text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer ${isCallWaiter ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'}`}
                                                >
                                                    {isCallWaiter ? 'Descartar' : 'Rechazar'}
                                                </button>
                                                {!isCallWaiter && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveClientCart(request.id, request.customer_name, request.items)}
                                                        className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-2xl text-[10px] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                                    >
                                                        ✅ Aprobar y Agregar
                                                    </button>
                                                )}
                                                {isCallWaiter && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectRequest(request.id)}
                                                        className="flex-[2] py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-2xl text-[10px] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                                    >
                                                        🛎️ Marcar como Atendido
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}


                        {cart.length === 0 ? (
                            <div className="py-20 text-center select-none bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-850 rounded-3xl p-6">
                                <span className="text-5xl block animate-pulse">📥</span>
                                <span className="text-sm font-extrabold text-gray-700 dark:text-gray-300 mt-4 block">El pedido está vacío</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">Añade platos seleccionándolos desde el menú.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.product_id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-850 rounded-2xl shadow-sm flex flex-col gap-3 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                                                <span className="text-xs font-semibold text-orange-550 dark:text-orange-405 mt-0.5 block">
                                                    ${item.price.toFixed(2)} c/u
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder="Notas (ej: sin cebolla)"
                                                value={item.notes}
                                                onChange={e => updateNotes(item.product_id, e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                            />
                                            {/* Quantity Selector */}
                                            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, -1)}
                                                    className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 font-black flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, 1)}
                                                    className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 font-black flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pedidos Activos de la Mesa */}
                        {activeOrders && activeOrders.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-wider text-gray-450 dark:text-gray-500 border-b border-gray-200/50 dark:border-gray-800 pb-2">
                                    Pedidos Activos
                                </h2>
                                <div className="space-y-4">
                                    {activeOrders.map((order, orderIdx) => (
                                        <div key={order.id || orderIdx} className="bg-emerald-500/10 border border-emerald-500/25 dark:border-emerald-500/35 rounded-3xl p-5 shadow-sm space-y-3">
                                            <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-2 bg-emerald-500/20 rounded-2xl text-base">🍽️</span>
                                                    <div>
                                                        <h3 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-xs">Pedido en curso</h3>
                                                        <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold">
                                                            A nombre de: <span className="font-bold text-emerald-700 dark:text-emerald-300">{order.customer_name || 'General'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-black text-emerald-700 dark:text-emerald-300">${Number(order.total_amount).toFixed(2)}</span>
                                                    {restaurant.waiters_can_collect_payment && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePayOrder(order)}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wide transition-colors shadow-sm"
                                                        >
                                                            Cobrar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 py-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start text-[11px] bg-white/50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-emerald-500/10 dark:border-emerald-500/20">
                                                        <div>
                                                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mr-1.5">{item.quantity}x</span>
                                                            <span className="font-bold text-gray-800 dark:text-gray-200">{item.product.name}</span>
                                                            {item.notes && (
                                                                <span className="block text-[9px] text-gray-500 dark:text-gray-400 italic mt-0.5">Nota: {item.notes}</span>
                                                            )}
                                                        </div>
                                                        <span className="font-extrabold text-gray-700 dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Menu Selection Panel */}
                <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between lg:overflow-hidden bg-white dark:bg-gray-900">
                    <div className="flex-1 flex flex-col lg:overflow-hidden space-y-4">
                        {/* Search and Category Tabs */}
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="🔍 Buscar plato o bebida..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/65 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            />

                            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:scale-102 active:scale-98 ${
                                            selectedCategory === cat
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/10'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700/80 dark:text-gray-300'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtered Products List */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[440px] lg:max-h-none border-t border-gray-150 dark:border-gray-800/80 pt-3">
                            {filteredProducts.length === 0 ? (
                                <p className="col-span-full text-center text-xs text-gray-400 dark:text-gray-500 py-16">No se encontraron productos en esta categoría.</p>
                            ) : (
                                filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-orange-500/40 dark:hover:border-orange-500/40 hover:shadow-md cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 active:scale-98 gap-2 group min-h-[110px] shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex gap-2.5 min-w-0">
                                            {product.image_path ? (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-850 flex-shrink-0">
                                                    <img
                                                        src={product.image_path}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center border border-orange-500/10 dark:border-orange-500/20 flex-shrink-0 text-lg shadow-inner group-hover:scale-105 transition-all duration-300">
                                                    🍲
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-extrabold text-[11px] text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight line-clamp-2">{product.name}</h4>
                                                {product.description && (
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 leading-tight">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-gray-50 dark:border-gray-850">
                                            <span className="font-black text-orange-600 dark:text-orange-400 text-[11px]">
                                                ${Number(product.price).toFixed(2)}
                                            </span>
                                            <span className="text-[9px] bg-orange-500 text-white font-black px-2 py-1 rounded-lg border border-transparent shadow-sm shadow-orange-500/15 group-hover:bg-orange-600 transition-colors">
                                                + Añadir
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Floating Sticky Footer Actions */}
            <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/85 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between w-full md:w-auto items-center gap-6 bg-gray-50 dark:bg-gray-950 px-4 py-2.5 rounded-2xl border border-gray-150 dark:border-gray-850">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block">Total a Cobrar</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                            ${(activeOrders.reduce((sum, order) => sum + Number(order.total_amount), 0) + calculateTotal()).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {table.status !== 'free' && (
                        <>
                            <button
                                onClick={handleRelease}
                                className="flex-1 md:flex-none py-3 px-4 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-gray-800 dark:hover:bg-rose-955/20 text-gray-600 dark:text-gray-300 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                ❌ Liberar Mesa
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="flex-1 md:flex-none py-3 px-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-xs shadow-md shadow-orange-600/10 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        💾 Guardar Pedido
                    </button>
                </div>
            </footer>
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
        </div>
    );
}
