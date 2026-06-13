import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    ArrowLeft, Bell, QrCode, Shield, ShoppingCart, Send, CheckCircle, Smartphone, Zap, HelpCircle
} from 'lucide-react';

interface Table {
    id: number;
    number: string;
    status: 'free' | 'occupied' | 'payment_pending';
    items: Array<{
        name: string;
        qty: number;
        price: number;
    }>;
    total: number;
    pin: string;
}

interface PageProps {
    dbRestaurant?: {
        id: number;
        name: string;
        address: string;
        tables?: Array<{
            id: number;
            number: string;
            status: 'free' | 'occupied' | 'payment_pending';
            qr_code_token?: string;
        }>;
        products?: Array<{
            id: number;
            name: string;
            price: number | string;
            category: string;
            description: string | null;
        }>;
    } | null;
}

export default function SimulatorClient({ dbRestaurant }: PageProps) {
    // 1. Dynamic Tables State Initializer
    const [tables, setTables] = useState<Table[]>(() => {
        if (dbRestaurant && dbRestaurant.tables && dbRestaurant.tables.length > 0) {
            return dbRestaurant.tables.map((t, idx) => ({
                id: t.id,
                number: t.number,
                status: t.status || 'free',
                total: t.status === 'occupied' ? 18.00 : t.status === 'payment_pending' ? 44.00 : 0,
                items: t.status === 'occupied' 
                    ? [{ name: 'Pizza Margarita', qty: 1, price: 15.00 }, { name: 'Coca Cola', qty: 1, price: 3.00 }]
                    : t.status === 'payment_pending'
                    ? [{ name: 'Lasagna Boloñesa', qty: 2, price: 18.50 }, { name: 'Limonada Natural', qty: 2, price: 3.50 }]
                    : [],
                pin: String(1000 + (t.id % 9000))
            }));
        }
        return [
            { id: 1, number: 'Mesa 1', status: 'free', total: 0, items: [], pin: '4812' },
            { id: 2, number: 'Mesa 2', status: 'occupied', total: 18.00, items: [{ name: 'Pizza Margarita', qty: 1, price: 15.00 }, { name: 'Coca Cola', qty: 1, price: 3.00 }], pin: '9153' },
            { id: 3, number: 'Mesa 3', status: 'payment_pending', total: 44.00, items: [{ name: 'Lasagna Boloñesa', qty: 2, price: 18.50 }, { name: 'Limonada Natural', qty: 2, price: 3.50 }], pin: '2048' },
            { id: 4, number: 'Mesa 4', status: 'free', total: 0, items: [], pin: '7361' },
        ];
    });

    const [selectedTableId, setSelectedTableId] = useState<number>(() => {
        if (dbRestaurant && dbRestaurant.tables && dbRestaurant.tables.length > 0) {
            return dbRestaurant.tables[0].id;
        }
        return 1;
    });
    
    // Client security and ordering state
    const [scanned, setScanned] = useState<boolean>(false);
    const [pinInput, setPinInput] = useState<string>('');
    const [pinVerified, setPinVerified] = useState<boolean>(false);
    const [pinError, setPinError] = useState<string>('');

    // Dynamic Menu Items Initializer
    const [menuItems] = useState<Array<{ name: string; price: number; category: string }>>(() => {
        if (dbRestaurant && dbRestaurant.products && dbRestaurant.products.length > 0) {
            return dbRestaurant.products.map(p => ({
                name: p.name,
                price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                category: p.category || 'Fuertes'
            }));
        }
        return [
            { name: 'Pizza Margarita', price: 15.00, category: 'Fuertes' },
            { name: 'Lasagna Boloñesa', price: 18.50, category: 'Fuertes' },
            { name: 'Bruschetta de Tomate', price: 8.00, category: 'Entradas' },
            { name: 'Coca Cola', price: 3.00, category: 'Bebidas' },
            { name: 'Limonada Natural', price: 3.50, category: 'Bebidas' },
            { name: 'Tiramisú Clásico', price: 6.55, category: 'Postres' }
        ];
    });

    const [cart, setCart] = useState<Array<{ name: string; qty: number; price: number }>>([]);
    
    // Compute dynamic categories based on loaded items
    const categories = Array.from(new Set(menuItems.map(item => item.category)));
    const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'Fuertes');
    const [activeFlowStep, setActiveFlowStep] = useState<number>(1);

    const activeTable = tables.find(t => t.id === selectedTableId) || tables[0];

    const handleScanTable = () => {
        setScanned(true);
        setPinVerified(false);
        setPinInput('');
        setPinError('');
        setCart([]);
        setActiveFlowStep(2);
    };

    const handleVerifyPin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === activeTable.pin) {
            setPinVerified(true);
            setPinError('');
            setActiveFlowStep(3);
        } else {
            setPinError('PIN incorrecto. Revisa el PIN de la mesa seleccionada.');
        }
    };

    const addToCart = (name: string, price: number) => {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            setCart(cart.map(item => item.name === name ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { name, qty: 1, price }]);
        }
    };

    const removeFromCart = (name: string) => {
        const existing = cart.find(item => item.name === name);
        if (existing && existing.qty > 1) {
            setCart(cart.map(item => item.name === name ? { ...item, qty: item.qty - 1 } : item));
        } else {
            setCart(cart.filter(item => item.name !== name));
        }
    };

    const handleSendOrder = () => {
        if (cart.length === 0) return;

        setTables(tables.map(table => {
            if (table.id === selectedTableId) {
                // Merge cart items with existing table items
                const updatedItems = [...table.items];
                cart.forEach(cartItem => {
                    const idx = updatedItems.findIndex(i => i.name === cartItem.name);
                    if (idx > -1) {
                        updatedItems[idx].qty += cartItem.qty;
                    } else {
                        updatedItems.push(cartItem);
                    }
                });
                const updatedTotal = updatedItems.reduce((acc, i) => acc + (i.price * i.qty), 0);
                return {
                    ...table,
                    items: updatedItems,
                    total: updatedTotal,
                    status: 'occupied' as const
                };
            }
            return table;
        }));
        setCart([]);
        setActiveFlowStep(4);
    };

    const handleCallWaiterForPayment = () => {
        setTables(tables.map(table =>
            table.id === selectedTableId && table.status === 'occupied'
                ? { ...table, status: 'payment_pending' as const }
                : table
        ));
    };

    return (
        <PublicLayout>
            <Head title="Acceso Cliente - bocado!" />
            
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
                            🍽️ Rol Cliente
                        </span>
                    </div>
                </div>

                {/* Cliente Interactive Workflow Guide */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 p-6 rounded-[32px] shadow-sm space-y-4 max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3 gap-2">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
                                Flujo de Auto-servicio del Cliente (Lógica QR bocado!)
                            </h3>
                            <p className="text-[11px] text-slate-400 font-semibold">Simula la experiencia de un comensal desde que escanea el QR hasta que paga la cuenta.</p>
                        </div>
                        <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-xl font-black">
                            Paso {activeFlowStep} de 4
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Step 1 */}
                        <div 
                            onClick={() => {
                                setScanned(false);
                                setPinVerified(false);
                                setActiveFlowStep(1);
                            }}
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
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Escanear Mesa</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Selecciona una mesa y simula el escaneo del código QR con tu celular.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div 
                            onClick={() => {
                                setScanned(true);
                                setPinVerified(false);
                                setActiveFlowStep(2);
                            }}
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
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Ingresar PIN</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Verifica el código de seguridad de 4 dígitos para desbloquear la comanda.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div 
                            onClick={() => {
                                setScanned(true);
                                setPinVerified(true);
                                setActiveFlowStep(3);
                            }}
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
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Armar Pedido</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Agrega platos de la carta digital a tu carrito y ordénalos a cocina.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div 
                            onClick={() => {
                                setScanned(true);
                                setPinVerified(true);
                                setActiveFlowStep(4);
                            }}
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
                                <span className="text-xs font-black text-slate-700 dark:text-gray-200">Solicitar Cuenta</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Llama al mesero solicitando la cuenta acumulada para cerrar la mesa.
                            </p>
                        </div>
                    </div>

                    {/* Explanatory text */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-gray-800 rounded-2xl text-xs space-y-2">
                        {activeFlowStep === 1 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 1: Seleccionar Mesa y Simular Escaneo</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Elige cualquiera de las mesas del listado izquierdo. Verás su código de PIN correspondiente. 
                                    En la pantalla del celular simulado a la derecha, haz clic en el botón <strong>"Escanear QR de Mesa"</strong> para recrear la lectura del código.
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 2 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 2: Validación del PIN de Seguridad de la Mesa</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    En la pantalla del celular simulado se solicita un PIN. En la web real, esto previene que usuarios fuera del establecimiento hagan pedidos de broma. 
                                    Digita el PIN indicado en el listado izquierdo para la mesa seleccionada (ej: <code>{activeTable.pin}</code>) y presiona "Acceder al Menú".
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 3 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 3: Digital Menu y Carrito de Compras</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    ¡Ya estás dentro! Filtra los platos por categoría usando las pestañas. Agrega productos al carrito pulsando el botón <strong>"+"</strong>. 
                                    Una vez decidas tu comanda, revisa el carrito y haz clic en <strong>"Enviar Pedido a Cocina"</strong>. La orden se enviará y la mesa pasará a estar ocupada.
                                </p>
                            </div>
                        )}
                        {activeFlowStep === 4 && (
                            <div>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 block mb-1">Paso 4: Consumo Acumulado y Cuentas</span>
                                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-[11px]">
                                    Bajo la sección <strong>"Mi Consumo Acumulado"</strong> podrás ver todo lo ordenado y el subtotal de la mesa. Cuando estés listo para retirarte, presiona <strong>"Pedir Cuenta (Llamar Mesero)"</strong> en la parte inferior. La mesa cambiará a estado "Por Cobrar", notificando al administrador de inmediato.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table QR Scanner (Left side controls) & Smartphone Simulator (Right side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
                    
                    {/* Left: Table Simulator selector & PIN codes (5 columns) */}
                    <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-gray-800 rounded-[32px] space-y-6 shadow-sm">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <QrCode className="w-5 h-5 text-orange-500" />
                                Simulador de Códigos QR
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                                Selecciona una mesa de tu negocio real o ficticio. Cada mesa tiene un código de seguridad PIN único generado por la plataforma.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {tables.map(table => (
                                <button
                                    key={table.id}
                                    onClick={() => {
                                        setSelectedTableId(table.id);
                                        setScanned(false);
                                        setPinVerified(false);
                                        setCart([]);
                                        setActiveFlowStep(1);
                                    }}
                                    className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                                        selectedTableId === table.id
                                            ? 'ring-2 ring-orange-500 bg-orange-50/20 dark:bg-slate-900 border-orange-500'
                                            : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-gray-800 hover:border-slate-300'
                                    }`}
                                >
                                    <div>
                                        <span className="text-xs font-black block text-slate-800 dark:text-white">{table.number}</span>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">PIN temporal: {table.pin}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                        table.status === 'free'
                                            ? 'bg-green-500/10 text-green-600'
                                            : table.status === 'occupied'
                                            ? 'bg-amber-500/10 text-amber-600'
                                            : 'bg-rose-500/10 text-rose-600'
                                    }`}>
                                        {table.status === 'free' ? 'Libre' : table.status === 'occupied' ? 'Ocupada' : 'Por Cobrar'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed">
                            💡 Al cambiar de mesa, el celular simulado se desconecta y te solicita escanear el nuevo QR correspondiente para validar el PIN de seguridad de esa ubicación.
                        </div>
                    </div>

                    {/* Right: Simulated Client Smartphone Interface (7 columns) */}
                    <div className="lg:col-span-7 flex justify-center items-center">
                        <div className="border-4 border-slate-300 dark:border-gray-800 bg-slate-200 dark:bg-slate-900 rounded-[44px] p-3 shadow-2xl w-full max-w-sm relative transition-colors duration-300">
                            {/* Notch decoration */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-200 dark:bg-slate-900 rounded-full z-20 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-black border border-slate-300 dark:border-gray-800" />
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-[32px] overflow-hidden min-h-[500px] flex flex-col justify-between relative pt-8 text-slate-800 dark:text-gray-100">
                                
                                {/* 1. Scanned State: Not scanned yet */}
                                {!scanned ? (
                                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                                            <Smartphone className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-black">Escanea el Código QR</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed">
                                                Presiona el botón para simular que escaneas el código QR impreso en la <strong>{activeTable.number}</strong>.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleScanTable}
                                            className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            Escanear QR de Mesa
                                        </button>
                                    </div>
                                ) : !pinVerified ? (
                                    /* 2. Security PIN Validation */
                                    <div className="flex-1 flex flex-col justify-between p-6">
                                        <div className="space-y-6 text-center mt-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h4 className="text-sm font-black">Validación de PIN</h4>
                                                <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                                                    Introduce el PIN temporal de seguridad de la <strong>{activeTable.number}</strong> (<code>{activeTable.pin}</code>).
                                                </p>
                                            </div>
                                            
                                            <form onSubmit={handleVerifyPin} className="space-y-3 max-w-[200px] mx-auto">
                                                <input
                                                    type="password"
                                                    maxLength={4}
                                                    placeholder="Ej: 1234"
                                                    value={pinInput}
                                                    onChange={e => setPinInput(e.target.value)}
                                                    className="w-full p-2.5 text-center text-lg font-black tracking-widest border border-slate-200 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 dark:text-white placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                                                />
                                                {pinError && <p className="text-[9px] text-red-500 font-bold leading-tight">{pinError}</p>}
                                                <button
                                                    type="submit"
                                                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
                                                >
                                                    Acceder al Menú
                                                </button>
                                            </form>
                                        </div>
                                        
                                        <button
                                            onClick={() => {
                                                setScanned(false);
                                                setActiveFlowStep(1);
                                            }}
                                            className="text-[10px] text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold block text-center"
                                        >
                                            Atrás
                                        </button>
                                    </div>
                                ) : (
                                    /* 3. Interactive Digital Menu View */
                                    <div className="flex-1 flex flex-col justify-between min-h-[420px]">
                                        
                                        {/* Internal Header of digital menu */}
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px]">
                                            <span className="font-black text-slate-700 dark:text-white truncate max-w-[150px]">{dbRestaurant?.name || 'bocado! restaurante'}</span>
                                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold rounded-full shrink-0">{activeTable.number}</span>
                                        </div>
 
                                        {/* Categories selectors */}
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-800/60 flex gap-2 overflow-x-auto">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setActiveCategory(cat)}
                                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-all ${
                                                        activeCategory === cat
                                                            ? 'bg-orange-600 text-white shadow'
                                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-gray-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
 
                                        {/* Main list & Catalog */}
                                        <div className="flex-1 p-4 space-y-4 max-h-[240px] overflow-y-auto">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Carta Digital</span>
                                                <div className="space-y-2">
                                                    {menuItems.filter(item => item.category === activeCategory).map((item, idx) => (
                                                        <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px]">
                                                            <div className="max-w-[180px] truncate">
                                                                <span className="font-bold text-slate-800 dark:text-white block truncate">{item.name}</span>
                                                                <span className="text-orange-600 dark:text-orange-400 font-black">${item.price.toFixed(2)}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => addToCart(item.name, item.price)}
                                                                className="w-5 h-5 bg-orange-600 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-all font-black"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
 
                                            {/* Local Cart Review */}
                                            {cart.length > 0 && (
                                                <div className="border-t border-slate-100 dark:border-gray-800 pt-3">
                                                    <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Mi Carrito de Pedidos</span>
                                                    <div className="space-y-1.5">
                                                        {cart.map((cartItem, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-[10px] bg-orange-500/5 p-1.5 rounded-lg border border-orange-500/10">
                                                                <span className="font-semibold text-slate-700 dark:text-gray-300">
                                                                    <span className="font-black text-orange-600 dark:text-orange-400 mr-1.5">{cartItem.qty}x</span>
                                                                    {cartItem.name}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-800 dark:text-white">${(cartItem.price * cartItem.qty).toFixed(2)}</span>
                                                                    <button
                                                                        onClick={() => removeFromCart(cartItem.name)}
                                                                        className="text-red-500 font-black text-xs px-1"
                                                                    >
                                                                        -
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <button
                                                            onClick={handleSendOrder}
                                                            className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-orange-600/10"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                            Enviar Pedido a Cocina
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
 
                                            {/* Account Summary */}
                                            <div className="border-t border-slate-100 dark:border-gray-800 pt-3">
                                                <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Mi Consumo Acumulado</span>
                                                {activeTable.items.length === 0 ? (
                                                    <span className="text-[10px] text-slate-400 italic block text-center py-2">No has realizado pedidos todavía.</span>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {activeTable.items.map((it, i) => (
                                                            <div key={i} className="flex justify-between text-[10px] text-slate-600 dark:text-gray-400">
                                                                <span>{it.qty}x {it.name}</span>
                                                                <span className="font-bold">${(it.price * it.qty).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-gray-800 pt-1.5 font-black text-[11px] text-slate-800 dark:text-white">
                                                            <span>Total Cuenta:</span>
                                                            <span>${activeTable.total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
 
                                        {/* Action buttons inside digital menu */}
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-gray-800 flex flex-col gap-1.5">
                                            {activeTable.status === 'occupied' ? (
                                                <button
                                                    onClick={handleCallWaiterForPayment}
                                                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-[10px] transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1"
                                                >
                                                    <Bell className="w-3.5 h-3.5" />
                                                    Pedir Cuenta (Llamar Mesero)
                                                </button>
                                            ) : activeTable.status === 'payment_pending' ? (
                                                <div className="w-full py-2 bg-orange-600/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold rounded-xl text-[10px] text-center flex items-center justify-center gap-1">
                                                    <span>⏳ Mesero en camino con la cuenta...</span>
                                                </div>
                                            ) : (
                                                <div className="py-2 text-center text-[9px] text-slate-400 italic">
                                                    Agrega platos al carrito y ordénalos para ver tu cuenta.
                                                </div>
                                            )}
                                        </div>
 
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
 
                </div>
 
            </div>
        </PublicLayout>
    );
}
