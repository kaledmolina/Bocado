import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, ShoppingCart, X, Plus, Minus, Trash2, Clock, Check, Camera, RefreshCw, AlertTriangle, Send } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string;
    is_available: boolean;
    image_path?: string | null;
}

interface Table {
    id: number;
    number: string;
    status: string;
    qr_code_token: string;
    is_active_for_order?: boolean;
    temp_pin?: string | null;
    cart_data?: Array<{
        id: string;
        customer_name: string;
        created_at: string;
        items: Array<{
            product_id: number;
            name: string;
            price: number;
            quantity: number;
            notes?: string;
        }>;
    }> | null;
    pin_requested?: boolean;
    pin_updated_at?: string | null;
}

interface Restaurant {
    name: string;
    address: string | null;
    phone: string | null;
    security_waiter_activation?: boolean;
    security_table_pin?: boolean;
    security_require_physical_scan?: boolean;
    client_can_call_waiter?: boolean;
    primary_color?: string;
    secondary_color?: string;
    welcome_subtitle?: string;
}

interface ActiveOrder {
    id: number;
    total_amount: number;
    customer_name?: string;
    items: Array<{
        id: number;
        quantity: number;
        price: number;
        notes: string | null;
        product: {
            name: string;
        }
    }>;
}

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    notes: string;
}

interface Props {
    table: Table;
    restaurant: Restaurant;
    categories: {
        [key: string]: Product[];
    };
    activeOrders: ActiveOrder[] | null;
    isDemo?: boolean;
}

export default function Menu({ table, restaurant, categories, activeOrders, isDemo }: Props) {
    const { errors } = usePage().props as any;
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    const [isDemoMode, setIsDemoMode] = useState(!!isDemo);

    useEffect(() => {
        if (isDemo) {
            setIsDemoMode(true);
            return;
        }
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('demo') === 'true') {
                setIsDemoMode(true);
            }
        }
    }, [isDemo]);

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

    const formatPrice = (price: number | string) => {
        return '$' + Number(price).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const [selectedCategory, setSelectedCategory] = useState<string>(
        Object.keys(categories)[0] || ''
    );
    const [isAccountOpen, setIsAccountOpen] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);

    // Dynamic PIN & Cart States
    const [pinInput, setPinInput] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('entered_pin_table_' + table.id) || '';
        }
        return '';
    });
    const [isPinVerified, setIsPinVerified] = useState(!restaurant.security_table_pin);
    const [pinRequested, setPinRequested] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Lockout condition: Table already has pending cart order items awaiting waiter approval
    const isLockedOut = !!(table.cart_data && table.cart_data.some(req => req.items && req.items.length > 0 && req.items[0].product_id !== 0));

    useEffect(() => {
        if (restaurant.security_table_pin) {
            const verified = table.temp_pin && pinInput === table.temp_pin;
            setIsPinVerified(!!verified);
            if (verified) {
                sessionStorage.setItem('entered_pin_table_' + table.id, pinInput);
            }
        } else {
            setIsPinVerified(true);
        }
    }, [pinInput, table.temp_pin, restaurant.security_table_pin]);

    const addToCart = (product: Product) => {
        if (isLockedOut) return;
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
                notes: ''
            }]);
        }
    };

    const updateCartQuantity = (productId: number, delta: number) => {
        if (isLockedOut) return;
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const updateCartNotes = (productId: number, notes: string) => {
        if (isLockedOut) return;
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, notes } : item
        ));
    };

    const calculateCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleRequestPin = () => {
        setPinRequested(true);
        router.post(route('qr.request-order', table.qr_code_token), {
            action: 'request_pin'
        }, {
            onFinish: () => {
                // Keep pinRequested true
            }
        });
    };

    const [customerName, setCustomerName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('customer_name') || '';
        }
        return '';
    });
    const [showNameModal, setShowNameModal] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && customerName) {
            localStorage.setItem('customer_name', customerName);
        }
    }, [customerName]);

    const handleSendOrder = () => {
        if (cart.length === 0 || isLockedOut) return;
        setShowNameModal(true);
    };

    const submitOrder = () => {
        if (!customerName.trim() || isLockedOut) return;

        setIsSending(true);
        router.post(route('qr.request-order', table.qr_code_token), {
            pin: pinInput,
            customer_name: customerName,
            items: cart as any
        }, {
            onSuccess: () => {
                setIsSending(false);
                setCart([]);
                setIsCartOpen(false);
                setShowNameModal(false);
                sessionStorage.removeItem('entered_pin_table_' + table.id);
                setPinInput('');
            },
            onError: () => {
                setIsSending(false);
                setShowNameModal(false);
            }
        });
    };

    // Physical QR Scan Security States
    const [isScanExpired, setIsScanExpired] = useState<boolean>(() => {
        if (typeof window !== 'undefined' && restaurant.security_require_physical_scan) {
            const lastScan = localStorage.getItem('last_scan_table_' + table.id);
            if (!lastScan) return true;
            const now = Date.now();
            // 30 minutes in milliseconds = 30 * 60 * 1000 = 1,800,000
            return now - parseInt(lastScan, 10) > 30 * 60 * 1000;
        }
        return false;
    });
    const [scannerActive, setScannerActive] = useState<boolean>(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [scannerSuccess, setScannerSuccess] = useState<boolean>(false);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const scannerElementId = 'physical-qr-reader';
    // Periodic scan validity checker (every 10 seconds)
    useEffect(() => {
        if (!restaurant.security_require_physical_scan) {
            setIsScanExpired(false);
            return;
        }

        const checkScanStatus = () => {
            const lastScan = localStorage.getItem('last_scan_table_' + table.id);
            if (!lastScan) {
                setIsScanExpired(true);
                return;
            }
            const now = Date.now();
            if (now - parseInt(lastScan, 10) > 30 * 60 * 1000) {
                setIsScanExpired(true);
            } else {
                setIsScanExpired(false);
            }
        };

        checkScanStatus();
        const interval = setInterval(checkScanStatus, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [restaurant.security_require_physical_scan, table.id]);

    // Poll the backend periodically for real-time table and order updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['table', 'activeOrder'],
            });
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // Handle scanner lifecycle
    useEffect(() => {
        if (isScanExpired && scannerActive) {
            const timer = setTimeout(() => {
                startQrScanner();
            }, 200);
            return () => {
                clearTimeout(timer);
                stopQrScanner();
            };
        } else {
            stopQrScanner();
        }
    }, [isScanExpired, scannerActive]);

    const startQrScanner = () => {
        setScannerError(null);
        setScannerSuccess(false);

        try {
            const html5QrCode = new Html5Qrcode(scannerElementId);
            qrScannerRef.current = html5QrCode;

            html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: (width, height) => {
                        const size = Math.min(width, height) * 0.75;
                        return { width: size, height: size };
                    }
                },
                (decodedText) => {
                    if (decodedText.includes(table.qr_code_token)) {
                        handleScanSuccess();
                    } else {
                        setScannerError(`Este código QR no pertenece a la Mesa ${table.number}. Por favor, escanea el código correcto.`);
                    }
                },
                () => {
                    // Ignore verbose scan errors
                }
            ).catch(err => {
                console.error("Error starting camera:", err);
                setScannerError("No se pudo acceder a la cámara. Por favor asegúrate de otorgar los permisos necesarios en tu navegador.");
            });
        } catch (e) {
            console.error("Scanner setup error:", e);
            setScannerError("Error al inicializar el escáner.");
        }
    };

    const stopQrScanner = async () => {
        if (qrScannerRef.current) {
            try {
                if (qrScannerRef.current.isScanning) {
                    await qrScannerRef.current.stop();
                }
            } catch (err) {
                console.error("Failed to stop scanner:", err);
            }
            qrScannerRef.current = null;
        }
    };

    const handleScanSuccess = () => {
        setScannerSuccess(true);
        localStorage.setItem('last_scan_table_' + table.id, Date.now().toString());
        
        setTimeout(() => {
            setIsScanExpired(false);
            setScannerActive(false);
            setScannerSuccess(false);
        }, 1200);
    };

    const categoryKeys = Object.keys(categories);

    const isWaiterCalled = !!(table.cart_data && table.cart_data.some(req => 
        req.items && req.items.length > 0 && req.items[0].product_id === 0
    ));

    const handleCallWaiter = () => {
        setIsSending(true);
        router.post(route('qr.request-order', table.qr_code_token), {
            pin: pinInput
        }, {
            onSuccess: () => {
                setIsSending(false);
                sessionStorage.removeItem('entered_pin_table_' + table.id);
                setPinInput('');
            },
            onError: () => {
                setIsSending(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans flex flex-col justify-between transition-colors duration-200">
            <Head title={`Menú - ${restaurant.name}`} />
            
            <style>{`
                .bg-orange-500, .bg-orange-600 {
                    background-color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .hover\\:bg-orange-600:hover, .hover\\:bg-orange-650:hover, .hover\\:bg-orange-700:hover {
                    filter: brightness(0.9) !important;
                    background-color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .text-orange-500, .text-orange-605, .text-orange-600, .text-orange-450 {
                    color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .border-orange-500\\/10, .border-orange-500\\/20 {
                    border-color: ${restaurant.primary_color || '#f97316'}33 !important;
                }
                .bg-orange-500\\/10 {
                    background-color: ${restaurant.primary_color || '#f97316'}1a !important;
                }
                .from-orange-500 {
                    --tw-gradient-from: ${restaurant.primary_color || '#f97316'} !important;
                    --tw-gradient-to: ${restaurant.secondary_color || '#1e293b'}00 !important;
                    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
                }
                .to-amber-600 {
                    --tw-gradient-to: ${restaurant.secondary_color || '#1e293b'} !important;
                }
                .shadow-orange-500\\/15 {
                    --tw-shadow-color: ${restaurant.primary_color || '#f97316'}26 !important;
                }
                .focus\\:ring-orange-500:focus {
                    --tw-ring-color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .focus\\:border-orange-500:focus {
                    border-color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .bg-amber-500\\/10 {
                    background-color: ${restaurant.primary_color || '#f97316'}1a !important;
                }
                .border-amber-500\\/20 {
                    border-color: ${restaurant.primary_color || '#f97316'}33 !important;
                }
                .text-amber-750, .text-amber-700, .text-amber-600 {
                    color: ${restaurant.primary_color || '#f97316'} !important;
                }
                .border-amber-500\\/10 {
                    border-color: ${restaurant.primary_color || '#f97316'}1a !important;
                }
                .from-orange-600 {
                    --tw-gradient-from: ${restaurant.primary_color || '#f97316'} !important;
                    --tw-gradient-to: ${restaurant.secondary_color || '#1e293b'}00 !important;
                    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
                }
                .to-amber-700 {
                    --tw-gradient-to: ${restaurant.secondary_color || '#1e293b'} !important;
                }
            `}</style>

            <div className="flex-1 pb-28">
                {/* Restaurant Cover */}
                <div className="bg-gradient-to-tr from-orange-500 to-amber-600 text-white py-12 px-6 text-center shadow-md relative">
                    <button
                        onClick={toggleTheme}
                        type="button"
                        className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        title="Cambiar tema"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-300" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-200" />
                        )}
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-white/20 rounded-full select-none">
                        📍 {table.number}
                    </span>
                    <h1 className="text-3xl font-black mt-3 tracking-tight">{restaurant.name}</h1>
                    {restaurant.address && <p className="text-xs opacity-80 mt-1">{restaurant.address}</p>}
                    {restaurant.welcome_subtitle && (
                        <p className="text-sm font-semibold opacity-90 mt-2.5 max-w-sm mx-auto leading-relaxed">
                            {restaurant.welcome_subtitle}
                        </p>
                    )}
                </div>

                {/* Main Menu content */}
                <main className="p-6 max-w-lg mx-auto space-y-6">
                    {/* Waiter Request / Table Status Area */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-orange-500/10 rounded-2xl text-lg">🛎️</span>
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Servicio de Mesa</h3>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    Solicita asistencia o llama al mesero directamente desde tu mesa.
                                </p>
                            </div>
                        </div>

                        {errors.security && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-[11px] text-rose-600 dark:text-rose-455 font-medium">
                                ⚠️ {errors.security}
                            </div>
                        )}

                        {isLockedOut ? (
                            <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4 text-center space-y-1">
                                <p className="text-xs font-black text-blue-700 dark:text-blue-400">🔒 Pedido Lock-out</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Tu pedido ya ha sido enviado al mesero y se encuentra en curso/preparación. No puedes modificarlo desde este dispositivo para evitar errores de comanda.
                                </p>
                            </div>
                        ) : restaurant.client_can_call_waiter === false ? (
                            <div className="bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-center">
                                <p className="text-xs font-black text-gray-500 dark:text-gray-400">🛎️ Llamado Desactivado</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">El servicio de llamada al mesero desde el celular no está disponible en este local.</p>
                            </div>
                        ) : !table.is_active_for_order ? (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center space-y-1">
                                <p className="text-xs font-black text-rose-700 dark:text-rose-400">🔕 Mesa Inactiva</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    Esta mesa no está habilitada. Pídele al mesero que active la Mesa {table.number} para poder solicitar atención.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-1">
                                {restaurant.security_table_pin && (
                                    <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-850 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">Autopedido QR</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                isPinVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {isPinVerified ? '🔓 Habilitado' : '🔒 Bloqueado'}
                                            </span>
                                        </div>

                                        {!isPinVerified ? (
                                            <div className="space-y-3">
                                                <p className="text-[11px] text-gray-500 leading-snug">
                                                    Para ordenar tú mismo, solicita el PIN de mesa al mesero y digítalo aquí:
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        maxLength={4}
                                                        placeholder="PIN de 4 dígitos"
                                                        value={pinInput}
                                                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-xs font-black tracking-widest text-center rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:tracking-normal"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRequestPin}
                                                        disabled={pinRequested || table.pin_requested}
                                                        className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-450 text-xs font-bold rounded-xl transition-all border border-orange-500/10 disabled:opacity-50"
                                                    >
                                                        {pinRequested || table.pin_requested ? '🔔 Solicitado' : '🛎️ Pedir PIN'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-emerald-650 dark:text-emerald-400 font-medium">
                                                ¡PIN validado correctamente! Puedes agregar tus platos y enviar tu orden usando el menú de abajo.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleCallWaiter}
                                    disabled={isSending || isWaiterCalled}
                                    className="w-full py-3 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black rounded-2xl text-xs shadow-md shadow-orange-500/15 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                >
                                    🛎️ {isWaiterCalled ? '¡Mesero Solicitado!' : 'Llamar al Mesero'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Active Orders Summary (if any items ordered) */}
                    {activeOrders && activeOrders.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-5 shadow-sm space-y-3">
                            <div
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex justify-between items-center cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🧾</span>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Tu Cuenta en Curso</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Ver platos ordenados</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                                        {formatPrice(activeOrders.reduce((sum, ord) => sum + Number(ord.total_amount), 0))}
                                    </span>
                                    <span className="text-gray-400 text-xs">{isAccountOpen ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isAccountOpen && (
                                <div className="border-t border-orange-500/10 pt-3 mt-1 space-y-4">
                                    {activeOrders.map(ord => (
                                        <div key={ord.id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                                                    #{ord.id.toString().padStart(5, '0')} {ord.customer_name ? `- ${ord.customer_name}` : ''}
                                                </span>
                                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {formatPrice(ord.total_amount)}
                                                </span>
                                            </div>
                                            {ord.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-xs pl-2 border-l-2 border-orange-200 dark:border-orange-900/50">
                                                    <span>
                                                        <span className="font-bold text-orange-600 mr-1.5">{item.quantity}x</span>
                                                        {item.product.name}
                                                    </span>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pending Client Order (Sent, awaiting waiter approval) */}
                    {table.cart_data && table.cart_data.some(req => req.items[0].product_id !== 0) && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⏳</span>
                                <div>
                                    <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">Pedido por Aprobar</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">El mesero está confirmando los pedidos de la mesa</p>
                                </div>
                            </div>
                            <div className="border-t border-amber-500/10 pt-3 mt-1 space-y-3">
                                {table.cart_data.filter(req => req.items[0].product_id !== 0).map((req, reqIdx) => (
                                    <div key={req.id || reqIdx} className="space-y-2 pb-2 border-b border-amber-500/10 last:border-0 last:pb-0">
                                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500">A nombre de: {req.customer_name}</p>
                                        {req.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span>
                                                    <span className="font-bold text-orange-600 mr-1.5">{item.quantity}x</span>
                                                    {item.name}
                                                </span>
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div className="flex justify-between border-t border-dashed border-amber-500/20 pt-2 font-black text-xs text-gray-900 dark:text-white">
                                    <span>Total en Espera:</span>
                                    <span>
                                        {formatPrice(
                                            table.cart_data
                                                .filter(req => req.items[0].product_id !== 0)
                                                .flatMap(req => req.items)
                                                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category tabs and list */}
                    <>
                            {/* Category tabs */}
                            {categoryKeys.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">El restaurante no tiene productos en el menú.</p>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex overflow-x-auto gap-2 pb-1 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
                                        {categoryKeys.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-4 py-2 text-xs font-extrabold whitespace-nowrap border-b-2 transition-all ${
                                                    selectedCategory === cat
                                                        ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Products List in Selected Category */}
                                    <div className="space-y-4">
                                        {categories[selectedCategory]?.map((product) => (
                                            <div
                                                key={product.id}
                                                className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm flex gap-4"
                                            >
                                                {product.image_path && (
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                                        <img
                                                            src={product.image_path}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <h3 className="font-bold text-sm text-gray-950 dark:text-gray-50 truncate">{product.name}</h3>
                                                            <span className="font-extrabold text-orange-600 text-sm whitespace-nowrap">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        </div>
                                                        {product.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1 line-clamp-2">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isPinVerified && !isLockedOut && table.is_active_for_order && (
                                                        <div className="flex items-center gap-2 mt-3 justify-end">
                                                            {cart.find(item => item.product_id === product.id) ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateCartQuantity(product.id, -1)}
                                                                        className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-705 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                                                                    >
                                                                        <Minus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <span className="text-xs font-black px-1.5">
                                                                        {cart.find(item => item.product_id === product.id)?.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => addToCart(product)}
                                                                        className="p-1 bg-orange-500 hover:bg-orange-650 text-white rounded-lg transition-all"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => addToCart(product)}
                                                                    className="py-1 px-3.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-sm transition-all"
                                                                >
                                                                    Agregar
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                </main>
            </div>

            {/* Physical Scan Lock Overlay */}
            {isScanExpired && table.is_active_for_order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
                        
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
                                <Camera className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mt-4">
                                Verificación Física de Mesa
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                Para garantizar que te encuentras físicamente en el local, debes escanear el código QR impreso en la mesa **{table.number}**.
                            </p>
                        </div>

                        {!scannerActive ? (
                            <div className="space-y-4 pt-2">
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-850 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-950/30 flex flex-col items-center justify-center">
                                    <span className="text-xs text-gray-450 dark:text-gray-500 mb-3">Presiona el botón para encender tu cámara</span>
                                    <button
                                        type="button"
                                        onClick={() => setScannerActive(true)}
                                        className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black rounded-2xl text-xs shadow-md shadow-orange-500/15 hover:shadow-lg transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
                                    >
                                        <Camera className="w-4 h-4" /> Activar Cámara y Escanear
                                    </button>

                                    {isDemoMode && (
                                        <button
                                            type="button"
                                            onClick={handleScanSuccess}
                                            className="mt-3 py-2 px-4 bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-orange-650 dark:text-orange-400 font-extrabold rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer border border-orange-200/50"
                                        >
                                            ⚡ Simular Escaneo Demo
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">
                                    * La sesión es válida por 30 minutos. Después de este tiempo, deberás re-escanear para seguir ordenando.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-800 shadow-inner flex flex-col items-center justify-center p-2">
                                    {/* The reader element for html5-qrcode */}
                                    <div 
                                        id={scannerElementId} 
                                        className="w-full aspect-square max-w-[260px] overflow-hidden rounded-xl"
                                    />
                                    
                                    {/* Laser scan animation line */}
                                    {!scannerSuccess && (
                                        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none flex flex-col justify-center items-center">
                                            <div className="w-[70%] h-0.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-bounce" />
                                        </div>
                                    )}

                                    {/* Success checkmark overlay */}
                                    {scannerSuccess && (
                                        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in duration-200">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <Check className="w-6 h-6 stroke-[3]" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">¡Código Verificado!</span>
                                        </div>
                                    )}
                                </div>

                                {scannerError && (
                                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2 text-left">
                                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-rose-600 dark:text-rose-450 font-medium leading-relaxed">
                                            {scannerError}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 justify-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            stopQrScanner();
                                            setScannerActive(false);
                                            setScannerError(null);
                                        }}
                                        className="py-2.5 px-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-xl transition-all"
                                    >
                                        Detener Cámara
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Sticky Floating Account Summary for Client */}
            {activeOrders && activeOrders.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-[24px] p-4 shadow-xl shadow-orange-600/30 border border-orange-500/20 flex items-center justify-between transition-all hover:scale-[1.01] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                            🧾
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block leading-tight">Total Consumido</span>
                            <span className="text-lg font-black">{formatPrice(activeOrders.reduce((sum, ord) => sum + Number(ord.total_amount), 0))}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsAccountOpen(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                        Ver Cuenta
                    </button>
                </div>
            )}

            {/* Cart Floating Button */}
            {cart.length > 0 && !isLockedOut && table.is_active_for_order && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-[24px] p-4 shadow-xl shadow-orange-650/30 border border-orange-500/20 flex items-center justify-between transition-all hover:scale-[1.01] animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg relative">
                            <ShoppingCart className="w-5 h-5 text-white" />
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-[10px] font-black rounded-full flex items-center justify-center text-white border border-orange-600">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block leading-tight">Pedido a Enviar</span>
                            <span className="text-lg font-black">{formatPrice(calculateCartTotal())}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                        Ver Carrito
                    </button>
                </div>
            )}

            {/* Sliding Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-t-[32px] rounded-b-2xl max-w-md w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto transform scale-100 transition-all duration-300">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-base font-black flex items-center gap-2 text-gray-900 dark:text-white">
                                <ShoppingCart className="w-5 h-5 text-orange-500" />
                                Tu Pedido
                            </h3>
                            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.product_id} className="space-y-2 pb-3 border-b border-gray-100 dark:border-gray-850">
                                    <div className="flex justify-between items-start text-sm">
                                        <div className="flex-1">
                                            <span className="font-extrabold text-orange-600 mr-2">{item.quantity}x</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => updateCartNotes(item.product_id, e.target.value)}
                                            placeholder="Notas (sin cebolla, salsa aparte...)"
                                            className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs rounded-xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-800 dark:text-white"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => updateCartQuantity(item.product_id, -1)}
                                                className="p-1.5 bg-gray-100 dark:bg-gray-850 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => addToCart(categories[selectedCategory]?.find(p => p.id === item.product_id) || { id: item.product_id, name: item.name, price: item.price } as any)}
                                                className="p-1.5 bg-gray-100 dark:bg-gray-850 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-4">
                                <span className="text-base font-bold text-gray-900 dark:text-white">Total del Pedido:</span>
                                <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                                    {formatPrice(calculateCartTotal())}
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-850 dark:text-gray-200 text-xs font-bold transition-all"
                                >
                                    Seguir Agregando
                                </button>
                                <button
                                    onClick={handleSendOrder}
                                    disabled={isSending}
                                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {isSending ? 'Enviando...' : 'Enviar Pedido'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Public footer */}
            <footer className="w-full text-center py-6 bg-white dark:bg-gray-900 border-t border-gray-150 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-widest pb-24">
                Desarrollado con 🧡 por bocado!
            </footer>

            {isDemoMode && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
                    <a
                        href="/demo-selector"
                        className="flex items-center gap-1.5 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-full shadow-2xl shadow-orange-500/20 border border-orange-500/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <span>⚡ Salir de Demo (Volver)</span>
                    </a>
                </div>
            )}
            {showNameModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowNameModal(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="mb-4">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">¿A nombre de quién?</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Por favor ingresa tu nombre para identificar tu pedido en la mesa.</p>
                        </div>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Tu nombre..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 dark:text-white font-bold mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNameModal(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={submitOrder}
                                disabled={!customerName.trim() || isSending}
                                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black disabled:opacity-50"
                            >
                                {isSending ? 'Enviando...' : 'Enviar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
