import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LogOut, Check, Trash2, Coffee, HelpCircle, DollarSign, Layers, Clock, Star, Briefcase, Plus, Bell, Key, Lock, Unlock, Coins, CheckSquare, MessageSquare } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import Toast from '@/Components/Toast';
import PaymentModal from '@/Components/PaymentModal';

interface Table {
    id: number;
    number: string;
    status: 'free' | 'occupied' | 'payment_pending';
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
            notes?: string;
        }>;
    }> | null;
    active_orders?: Array<{
        id: number;
        total_amount: number;
        customer_name?: string;
        items: Array<{
            id: number;
            quantity: number;
            price: number;
            product: {
                name: string;
            }
        }>
    }>;
}

interface HiringRestaurant {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
}

interface Application {
    id: number;
    restaurant: {
        name: string;
    };
    status: 'pending' | 'approved' | 'rejected';
}

interface JobOffer {
    id: number;
    restaurant: {
        id: number;
        name: string;
        address: string | null;
    };
    status: string;
}

interface Rating {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    restaurant: {
        name: string;
    };
}

interface Props {
    tables: Table[];
    waiterName: string;
    restaurant: {
        id: number;
        name: string;
        address: string | null;
        phone: string | null;
        waiters_can_collect_payment: boolean;
    } | null;
    hiringRestaurants: HiringRestaurant[];
    myApplications: Application[];
    jobOffers?: JobOffer[];
    activeShift: {
        id: number;
        started_at: string;
    } | null;
    ratings?: Rating[];
}

export default function Dashboard({ tables = [], waiterName, restaurant, hiringRestaurants = [], myApplications = [], jobOffers = [], activeShift, ratings = [] }: Props) {
    const { auth, flash } = usePage().props as any;
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'tables' | 'profile'>('tables');

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
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

    const [name, setName] = useState(auth.user?.name || '');
    const [email, setEmail] = useState(auth.user?.email || '');
    const [phone, setPhone] = useState(auth.user?.phone || '');
    const [city, setCity] = useState(auth.user?.city || '');
    const [birthday, setBirthday] = useState(auth.user?.birthday || '');
    const [bio, setBio] = useState(auth.user?.bio || '');
    const [skills, setSkills] = useState(auth.user?.skills || '');
    const [experienceDescription, setExperienceDescription] = useState(auth.user?.experience_description || '');
    const [isVisible, setIsVisible] = useState(auth.user?.is_visible_in_talents !== false);
    const [savingSettings, setSavingSettings] = useState(false);

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        router.post(route('waiter.profile.settings'), {
            name,
            email,
            phone,
            is_visible_in_talents: isVisible ? 1 : 0,
            city,
            birthday,
            bio,
            skills,
            experience_description: experienceDescription
        }, {
            preserveScroll: true,
            onFinish: () => setSavingSettings(false)
        });
    };

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

    const [paymentModal, setPaymentModal] = useState<{
        isOpen: boolean;
        tableId: number;
        totalAmount: number;
        order?: any;
    }>({
        isOpen: false,
        tableId: 0,
        totalAmount: 0,
    });

    const [orderSelectionModal, setOrderSelectionModal] = useState<{
        isOpen: boolean;
        tableId: number;
        orders: any[];
    }>({
        isOpen: false,
        tableId: 0,
        orders: [],
    });

    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePay = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!table.active_orders || table.active_orders.length === 0) {
            setToast({ message: 'No hay pedidos activos para cobrar.', type: 'error' });
            return;
        }

        if (table.active_orders.length > 1) {
            setOrderSelectionModal({
                isOpen: true,
                tableId: table.id,
                orders: table.active_orders,
            });
        } else {
            setPaymentModal({
                isOpen: true,
                tableId: table.id,
                totalAmount: Number(table.active_orders[0].total_amount),
                order: table.active_orders[0],
            });
        }
    };

    const handleConfirmPayment = (receivedAmount: number, changeAmount: number) => {
        router.post(route('tables.pay', paymentModal.tableId), {
            received_amount: receivedAmount,
            change_amount: changeAmount,
            order_id: paymentModal.order?.id,
        }, {
            onSuccess: () => {
                setPaymentModal(prev => ({ ...prev, isOpen: false }));
                setOrderSelectionModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleRelease = (e: React.MouseEvent, tableId: number) => {
        e.stopPropagation();
        e.preventDefault();
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

    const handleResign = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Desvincularse del Restaurante',
            message: '¿Estás seguro de que deseas desvincularte de este restaurante? Dejarás de formar parte de su plantilla.',
            confirmLabel: 'Sí, Desvincularme',
            onConfirm: () => {
                router.post(route('waiter.unlink'));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    const handleStartShift = () => {
        router.post(route('waiter.shifts.start'));
    };

    const handleEndShift = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Finalizar Turno',
            message: '¿Deseas finalizar tu turno actual? Se registrarán las horas laboradas.',
            confirmLabel: 'Finalizar Turno',
            onConfirm: () => {
                router.post(route('waiter.shifts.end'));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: false,
        });
    };

    const handleApply = (restaurantId: number) => {
        router.post(route('waiter.apply', restaurantId));
    };

    const handleAcceptInvitation = (applicationId: number) => {
        router.post(route('waiter.invitations.accept', applicationId));
    };

    const handleRejectInvitation = (applicationId: number) => {
        router.post(route('waiter.invitations.reject', applicationId));
    };

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
        } catch (error) {
            console.error("Audio error", error);
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
    const prevRequests = useRef<string>('');

    useEffect(() => {
        if (!restaurant || !activeShift) return;

        const interval = setInterval(() => {
            router.reload({
                only: ['tables'],
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [restaurant, activeShift]);

    useEffect(() => {
        if (tables.length === 0) return;
        const currentRequests = tables
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
    }, [tables]);

    const activeNotificationsList = tables.reduce<Array<{
        tableId: number;
        tableNumber: string;
        type: 'pin' | 'order' | 'payment';
        title: string;
        description: string;
        actionLabel: string;
        onAction: () => void;
    }>>((acc, table) => {
        if (table.pin_requested) {
            acc.push({
                tableId: table.id,
                tableNumber: table.number,
                type: 'pin',
                title: table.number,
                description: 'Solicita PIN de mesa',
                actionLabel: '🔑 Entregado',
                onAction: () => router.post(route('tables.clear-client-cart', table.id), {}, { preserveScroll: true })
            });
        }
        if (table.cart_data && table.cart_data.length > 0) {
            acc.push({
                tableId: table.id,
                tableNumber: table.number,
                type: 'order',
                title: table.number,
                description: `Nuevo pedido (${table.cart_data.length} ítems)`,
                actionLabel: '📝 Atender',
                onAction: () => router.get(route('waiter.order', table.id))
            });
        }
        if (table.status === 'payment_pending') {
            acc.push({
                tableId: table.id,
                tableNumber: table.number,
                type: 'payment',
                title: table.number,
                description: 'Solicita la cuenta 💵',
                actionLabel: '💵 Cobrar',
                onAction: () => handlePay({ stopPropagation: () => {} } as any, table.id, Number(table.active_order?.total_amount || 0))
            });
        }
        return acc;
    }, []);

    const totalTables = tables.length;
    const freeTables = tables.filter(t => t.status === 'free' && (!t.cart_data || t.cart_data.length === 0)).length;
    const occupiedTables = tables.filter(t => t.status === 'occupied' || (t.cart_data && t.cart_data.length > 0)).length;
    const pendingTables = tables.filter(t => t.status === 'payment_pending').length;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col font-sans transition-colors duration-250 pb-16">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <Head title="Mesero Dashboard" />

            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto transition-transform duration-300">
                <header className="backdrop-blur-xl border rounded-[24px] px-6 py-3.5 flex items-center justify-between transition-all duration-300 bg-white/75 dark:bg-gray-900/75 border-gray-200/50 dark:border-gray-800/80 shadow-lg shadow-gray-100/10 dark:shadow-black/25">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl hover:scale-105 transition-all">
                            b!
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent leading-none">
                                bocado!
                            </h1>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 font-semibold">
                                🧑‍🍳 Mesero: <span className="text-gray-700 dark:text-gray-300 font-black">{waiterName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {restaurant && activeShift && (
                            <button
                                onClick={toggleAudio}
                                type="button"
                                className={`px-3 py-2 flex items-center gap-1.5 font-black text-[11px] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border cursor-pointer ${
                                    audioEnabled
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20 shadow-sm'
                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
                                }`}
                                title={audioEnabled ? "Desactivar sonido" : "Activar sonido de notificaciones"}
                            >
                                <span>{audioEnabled ? "🔔" : "🔕"}</span>
                                <span className="hidden sm:inline">{audioEnabled ? "Sonido Activo" : "Activar Sonido"}</span>
                            </button>
                        )}
                        
                        <button
                            onClick={toggleTheme}
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-750 dark:text-gray-400 dark:hover:text-gray-250 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all cursor-pointer"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                        </button>
                        
                        <Link
                            href={route('profile.edit')}
                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 font-black rounded-2xl text-[11px] border border-gray-200 dark:border-gray-800 transition-all"
                        >
                            Perfil
                        </Link>
                        
                        {auth.user.actual_role === 'admin' && (
                            <Link
                                method="post"
                                href={route('admin.toggle-view-mode')}
                                as="button"
                                className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-650 hover:to-amber-750 text-white font-black rounded-2xl text-[11px] transition-all cursor-pointer shadow-md shadow-orange-500/10 flex items-center gap-1.5"
                            >
                                💼 Vista Admin
                            </Link>
                        )}
                        
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-455 font-black rounded-2xl text-[11px] transition-all cursor-pointer"
                        >
                            Salir
                        </Link>
                    </div>
                </header>
            </div>

            <main className="p-6 pt-24 sm:pt-28 max-w-5xl mx-auto w-full space-y-6 flex-1 flex flex-col justify-start">
                
                {/* Tab selector (only if the waiter is linked to a restaurant) */}
                {restaurant && (
                    <div className="flex bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-1 shadow-sm max-w-sm w-full mx-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('tables')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${
                                activeTab === 'tables'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                            }`}
                        >
                            🪑 Mesas y Pedidos
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all ${
                                activeTab === 'profile'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                            }`}
                        >
                            👤 Mi Perfil y Empleos
                        </button>
                    </div>
                )}

                {/* 1. FLOW: Waiter has no restaurant OR has selected the profile tab */}
                {(!restaurant || activeTab === 'profile') && (
                    <div className="space-y-6 flex-1 flex flex-col justify-start">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-lg">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Experiencia en bocado!</span>
                                    <span className="text-lg font-black text-gray-800 dark:text-white">{auth.user.experience_hours} horas</span>
                                </div>
                            </div>

                            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
                                    <Star className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Calificación Promedio</span>
                                    <span className="text-lg font-black text-gray-800 dark:text-white">
                                        {auth.user.average_rating > 0 ? `${auth.user.average_rating} / 5` : 'Sin calificaciones'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Current Restaurant Info Card */}
                        {restaurant && (
                            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-xl">🏪</span>
                                    <div>
                                        <h3 className="font-extrabold text-sm text-gray-855 dark:text-gray-250 font-black">Mi Restaurante Actual</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold">Detalles del establecimiento al que estás vinculado.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-650 dark:text-gray-400">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-855 dark:text-white">{restaurant.name}</p>
                                        {restaurant.address && <p>📍 <strong>Dirección:</strong> {restaurant.address}</p>}
                                        {restaurant.phone && <p>📞 <strong>Contacto:</strong> {restaurant.phone}</p>}
                                    </div>
                                    <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 rounded-2xl text-[10.5px] border border-gray-100 dark:border-gray-800 space-y-1">
                                        <p className="font-bold text-gray-850 dark:text-white">⚙️ Configuración y Políticas:</p>
                                        <ul className="list-disc list-inside mt-1.5 space-y-1 text-gray-500 dark:text-gray-400">
                                            <li>
                                                Cobro directo: {restaurant.waiters_can_collect_payment 
                                                    ? '✅ Habilitado (puedes cobrar mesas)' 
                                                    : '❌ Deshabilitado (solo admins cobran)'}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                {auth.user?.role !== 'admin' && (
                                    <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleResign}
                                            className="py-2 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-455 font-black rounded-xl text-xs transition-all border border-rose-100 dark:border-rose-900/30 shadow-sm"
                                        >
                                            ❌ Renunciar / Desvincularse del Restaurante
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Waiter Reviews Card */}
                        {ratings && ratings.length > 0 && (
                            <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm space-y-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <MessageSquare className="w-5 h-5 text-orange-500" />
                                    <div>
                                        <h3 className="font-extrabold text-sm text-gray-855 dark:text-gray-250 font-black">Reseñas de Establecimientos</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold">Comentarios de administradores sobre tu desempeño.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ratings.map((rating) => (
                                        <div key={rating.id} className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-xs text-gray-800 dark:text-white">{rating.restaurant?.name || 'Restaurante'}</span>
                                                <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                                                    {"★".repeat(rating.rating)}
                                                    {"☆".repeat(5 - rating.rating)}
                                                </div>
                                            </div>
                                            {rating.comment && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                    "{rating.comment}"
                                                </p>
                                            )}
                                            <span className="text-[9px] text-gray-450 dark:text-gray-500 block text-right">
                                                {new Date(rating.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visibility & Contact Settings */}
                        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm space-y-4">
                            <div>
                                <h3 className="font-extrabold text-sm text-gray-850 dark:text-gray-250">Ajustes de Perfil y Bolsa de Talentos</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Controla tu visibilidad y proporciona un número de contacto para que los locales interesados te puedan llamar.
                                </p>
                            </div>

                            <form onSubmit={handleSaveSettings} className="space-y-4 pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Ej. juan@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Número de Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Ej. +54 9 11 2345-6789"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            placeholder="Ej. Buenos Aires"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            value={birthday}
                                            onChange={e => setBirthday(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Habilidades / Especialidades
                                        </label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={e => setSkills(e.target.value)}
                                            placeholder="Ej. Coctelería, Servicio de vinos, Inglés intermedio, Manejo de bandeja"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Biografía / Presentación Corta
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            placeholder="Cuéntanos un poco sobre ti, tu actitud y tu forma de trabajar..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs h-20 resize-none"
                                            maxLength={500}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Experiencia Laboral Externa
                                        </label>
                                        <textarea
                                            value={experienceDescription}
                                            onChange={e => setExperienceDescription(e.target.value)}
                                            placeholder="Describe brevemente tus trabajos anteriores como mesero (restaurantes, tiempo trabajado, responsabilidades)..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs h-24 resize-none"
                                            maxLength={800}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850 sm:col-span-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                Aparecer en Bolsa de Talentos
                                            </label>
                                            <span className="text-[9px] text-gray-500 block">
                                                Permitir que los restaurantes te busquen
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsVisible(!isVisible)}
                                            className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer border border-transparent ${
                                                isVisible ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                                            }`}
                                        >
                                            <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="submit"
                                        disabled={savingSettings}
                                        className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {savingSettings ? 'Guardando...' : 'Guardar Ajustes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Job Offers Received */}
                        {jobOffers.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-extrabold text-sm text-gray-705 dark:text-gray-300 flex items-center gap-1.5">
                                    <span>📩</span> Ofertas de Empleo Recibidas ({jobOffers.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {jobOffers.map((offer) => (
                                        <div key={offer.id} className="p-5 bg-white dark:bg-gray-900 border-2 border-orange-500/20 dark:border-orange-500/30 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                                            <div>
                                                <h4 className="font-black text-base text-gray-950 dark:text-white">{offer.restaurant.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">📍 {offer.restaurant.address || 'Dirección no especificada'}</p>
                                                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                                    Te invitó a unirte
                                                </span>
                                            </div>
                                            <div className="flex gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-850">
                                                <button
                                                    onClick={() => handleRejectInvitation(offer.id)}
                                                    className="flex-1 py-2 rounded-xl border border-gray-250 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-350 text-xs font-bold transition-all"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptInvitation(offer.id)}
                                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                                >
                                                    Aceptar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submitted Applications */}
                        {myApplications.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-extrabold text-sm text-gray-700 dark:text-gray-300">Tus Postulaciones Activas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myApplications.map((app) => (
                                        <div key={app.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center justify-between shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-white">{app.restaurant.name}</h4>
                                                <span className="text-[10px] text-gray-400">Postulado recientemente</span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                app.status === 'pending'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : app.status === 'approved'
                                                    ? 'bg-green-500/10 text-green-600'
                                                    : 'bg-rose-500/10 text-rose-600'
                                            }`}>
                                                {app.status === 'pending' ? 'Pendiente' : app.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Job Search Listings */}
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Locales buscando meseros</h3>
                            </div>

                            {hiringRestaurants.length === 0 ? (
                                <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl flex flex-col items-center">
                                    <span className="text-3xl mb-3">💼</span>
                                    <h4 className="font-bold text-gray-700 dark:text-gray-300">No hay búsquedas activas</h4>
                                    <p className="text-xs text-gray-500 mt-1">Vuelve más tarde o comunícate directamente con tu restaurante.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {hiringRestaurants.map((rest) => {
                                        const alreadyApplied = myApplications.some(app => app.restaurant.name === rest.name && app.status === 'pending');
                                        return (
                                            <div key={rest.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl flex flex-col justify-between shadow-sm">
                                                <div>
                                                    <h4 className="font-extrabold text-base text-gray-950 dark:text-white">{rest.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1.5">📍 {rest.address || 'Dirección no especificada'}</p>
                                                    {rest.phone && <p className="text-xs text-gray-500 mt-1">📞 {rest.phone}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleApply(rest.id)}
                                                    disabled={alreadyApplied}
                                                    className={`w-full mt-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                                                        alreadyApplied 
                                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                                                    }`}
                                                >
                                                    {alreadyApplied ? 'Solicitud Enviada' : 'Enviar Solicitud'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. FLOW: Waiter is linked but shift is not started */}
                {restaurant && activeTab === 'tables' && !activeShift && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500/20 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10 font-bold text-4xl animate-pulse">
                            ☕
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{restaurant.name}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tu cuenta de mesero está vinculada a este restaurante. Debes iniciar turno para ver las mesas and recibir notificaciones.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                            <button
                                onClick={handleStartShift}
                                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                            >
                                <Clock className="w-4 h-4" />
                                Iniciar Turno
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. FLOW: Waiter is linked and shift is active */}
                {restaurant && activeTab === 'tables' && activeShift && (
                    <>
                        {/* Active Shift Info Alert */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-650 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl animate-pulse">⚡</span>
                                <div>
                                    <h3 className="font-extrabold text-sm">Turno en progreso</h3>
                                    <p className="text-[11px] text-emerald-100 font-medium">
                                        Iniciado el {new Date(activeShift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ¡Buen servicio!
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleEndShift}
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer"
                                >
                                    Finalizar Turno
                                </button>
                            </div>
                        </div>

                        {/* Real-time request notifications bar */}
                        {tables.some(t => t.cart_data && t.cart_data.length > 0) && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/10 border border-blue-500/20">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl animate-pulse">🛎️</span>
                                    <div>
                                        <h3 className="font-extrabold text-sm">Nuevas solicitudes de clientes en tiempo real</h3>
                                        <p className="text-[11px] text-blue-100 font-medium">Hay mesas esperando que atiendas </p>
                                    </div>
                                </div>
                                <span className="bg-white text-blue-600 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm">
                                    {tables.filter(t => t.cart_data && t.cart_data.length > 0).length} Mesa(s)
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">🪑</div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Mesas</span>
                                    <span className="text-base font-black text-gray-800 dark:text-white">{totalTables}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">🟢</div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Libres</span>
                                    <span className="text-base font-black text-gray-800 dark:text-white">{freeTables}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">🟡</div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Activas</span>
                                    <span className="text-base font-black text-gray-800 dark:text-white">{occupiedTables}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-sm">🛎️</div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Piden Cuenta</span>
                                    <span className="text-base font-black text-gray-800 dark:text-white">{pendingTables}</span>
                                </div>
                            </div>
                        </div>

                        {tables.length === 0 ? (
                            <div className="p-16 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl shadow-sm flex-1 flex flex-col items-center justify-center">
                                <Coffee className="w-12 h-12 text-gray-300 dark:text-gray-750 mb-3 animate-pulse" />
                                <h4 className="font-extrabold text-gray-800 dark:text-gray-200">No hay mesas registradas</h4>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                                {tables.map((table) => {
                                    const hasClientRequest = table.cart_data && table.cart_data.length > 0;
                                    const isFree = table.status === 'free';
                                    const isOccupied = table.status === 'occupied';
                                    const displayNum = table.number.replace(/\D/g, '') || table.number;

                                    return (
                                        <div
                                            key={table.id}
                                            onClick={() => router.get(route('waiter.order', table.id))}
                                            className={`group relative rounded-3xl border p-5 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-98 ${
                                                hasClientRequest
                                                    ? 'bg-gradient-to-b from-blue-50/70 to-blue-50/20 dark:from-blue-955/20 dark:to-transparent border-blue-300 dark:border-blue-900/60 ring-2 ring-blue-500/10'
                                                    : isFree
                                                    ? 'bg-white dark:bg-gray-900 border-gray-200/70 dark:border-gray-800/80'
                                                    : isOccupied
                                                    ? 'bg-gradient-to-b from-amber-50/70 to-amber-50/20 dark:from-amber-955/20 dark:to-transparent border-amber-200 dark:border-amber-900/60'
                                                    : 'bg-gradient-to-b from-rose-50/70 to-rose-50/20 dark:from-rose-955/20 dark:to-transparent border-rose-200 dark:border-rose-900/60'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${hasClientRequest ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                            {displayNum}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">
                                                                {table.number.toLowerCase().includes('mesa') ? table.number : `Mesa ${table.number}`}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${hasClientRequest ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {hasClientRequest ? 'Solicitud Cliente 🛎️' : table.status}
                                                                </span>
                                                                {table.temp_pin && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-500/10 text-orange-600 uppercase tracking-wider">
                                                                        PIN: {table.temp_pin}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850/80 px-2 py-1 rounded-xl border border-gray-150/40 dark:border-gray-800/40">
                                                            <span className="text-xs">{table.is_active_for_order ? "🛎️" : "🔕"}</span>
                                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">Llamar Mesero</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.post(route('tables.toggle-activation', table.id), {}, {
                                                                        preserveScroll: true,
                                                                        preserveState: true
                                                                    });
                                                                }}
                                                                type="button"
                                                                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-all flex-shrink-0 cursor-pointer ${
                                                                    table.is_active_for_order ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                                                                }`}
                                                                title={table.is_active_for_order ? "Desactivar botón Llamar al Mesero" : "Habilitar botón Llamar al Mesero"}
                                                            >
                                                                <span className="bg-white w-3 h-3 rounded-full shadow-sm" />
                                                            </button>
                                                        </div>

                                                        {!isFree && table.active_order && (
                                                            <div className="bg-gray-900 text-white dark:bg-white dark:text-gray-950 px-2.5 py-1.5 rounded-xl text-[11px] font-black">
                                                                ${table.active_order.total_amount.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3.5 space-y-1">
                                                    {table.pin_requested && (
                                                         <div className="mb-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[10.5px] text-amber-800 dark:text-amber-300 font-extrabold flex justify-between items-center gap-2 shadow-sm shadow-amber-500/5">
                                                             <span className="flex items-center gap-1.5 animate-pulse">
                                                                 <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                                 🔑 Cliente solicita PIN
                                                             </span>
                                                             <button
                                                                 onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     router.post(route('tables.clear-client-cart', table.id), {}, { preserveScroll: true });
                                                                 }}
                                                                 type="button"
                                                                 className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-[9px] cursor-pointer font-black transition-all shadow-sm"
                                                             >
                                                                 🔑 Entregado
                                                             </button>
                                                         </div>
                                                     )}
                                                    {hasClientRequest ? (
                                                        <div className="text-[11px] text-blue-600 dark:text-blue-400 max-h-24 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                                                            {table.cart_data!.map((req, i) => (
                                                                <div key={req.id || i} className="bg-blue-50/50 dark:bg-blue-900/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                                    <span className="font-extrabold text-blue-700 dark:text-blue-300 block mb-0.5">👤 {req.customer_name}:</span>
                                                                    <span className="text-blue-600/90 dark:text-blue-400/90 leading-tight block">
                                                                        {req.items && req.items.length > 0 
                                                                            ? req.items.map(item => `${item.quantity}x ${item.name}`).join(', ')
                                                                            : 'Llamado al mesero'}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[11px] text-gray-400 italic">Sin pedidos nuevos</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-150/40 dark:border-gray-800/40 flex gap-2">
                                                {!isFree ? (
                                                    <>
                                                        <button 
                                                            onClick={(e) => handleRelease(e, table.id)} 
                                                            type="button" 
                                                            className={`py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-black rounded-xl text-[10.5px] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                                                                restaurant.waiters_can_collect_payment ? 'flex-1' : 'w-full'
                                                            }`}
                                                        >
                                                            <Unlock className="w-3.5 h-3.5" /> Liberar
                                                        </button>
                                                        {restaurant.waiters_can_collect_payment && (
                                                            <button 
                                                                onClick={(e) => handlePay(e, table)} 
                                                                type="button" 
                                                                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-black rounded-xl text-[10.5px] shadow-sm shadow-emerald-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                                                            >
                                                                <Coins className="w-3.5 h-3.5" /> Cobrar
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button 
                                                        type="button" 
                                                        className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-750 text-white font-black rounded-xl text-[11px] shadow-sm shadow-orange-500/10 hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                                                    >
                                                        {hasClientRequest ? (
                                                            <>🛎️ Atender Autopedido</>
                                                        ) : (
                                                            <>➕ Nuevo Pedido</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

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

            {/* Order Selection Modal */}
            {orderSelectionModal.isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 dark:text-white">
                                <Coins className="w-6 h-6 text-emerald-500" />
                                Seleccionar Pedido a Cobrar
                            </h3>
                            <button onClick={() => setOrderSelectionModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {orderSelectionModal.orders.map((ord: any) => (
                                <div key={ord.id} className="p-4 bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg font-bold">
                                                #{ord.id.toString().padStart(5, '0')}
                                            </span>
                                            <div className="mt-1 font-bold text-gray-800 dark:text-gray-200 text-sm">
                                                A nombre de: {ord.customer_name || 'Desconocido'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                                ${Number(ord.total_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2 line-clamp-2">
                                        {ord.items?.map((item: any) => `${item.quantity}x ${item.product?.name}`).join(', ')}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPaymentModal({
                                                isOpen: true,
                                                tableId: orderSelectionModal.tableId,
                                                totalAmount: Number(ord.total_amount),
                                                order: ord
                                            });
                                        }}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                    >
                                        <Coins className="w-3.5 h-3.5" />
                                        Cobrar este pedido
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {restaurant && activeShift && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={notificationsRef}>
                    {showNotifications && (
                        <div className="mb-4 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                                <span className="font-extrabold text-gray-850 dark:text-white flex items-center gap-1.5">
                                    <Bell className="w-3.5 h-3.5 text-orange-500" /> Solicitudes Pendientes
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-850 text-[10px] rounded-lg font-bold text-gray-500">
                                    {activeNotificationsList.length} total
                                </span>
                            </div>

                            {activeNotificationsList.length === 0 ? (
                                <div className="text-center py-6 text-gray-450 dark:text-gray-500 font-medium italic">
                                    🎉 ¡Todo al día! Sin notificaciones
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                                    {activeNotificationsList.map((notif, index) => (
                                        <div key={index} className="flex justify-between items-center gap-2 p-2 bg-gray-50 dark:bg-gray-950/40 rounded-xl border border-gray-100 dark:border-gray-850">
                                            <div>
                                                <span className="font-black text-gray-900 dark:text-white block">
                                                    {notif.title}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block leading-tight font-medium">
                                                    {notif.description}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    notif.onAction();
                                                    setShowNotifications(false);
                                                }}
                                                className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-black text-[9px] whitespace-nowrap cursor-pointer transition-all shadow-sm shadow-orange-500/10 active:scale-95"
                                            >
                                                {notif.actionLabel}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        type="button"
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer relative border ${
                            activeNotificationsList.length > 0
                                ? 'bg-gradient-to-tr from-orange-500 to-amber-600 border-orange-400/20 text-white shadow-orange-500/25 animate-pulse'
                                : 'bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800 text-gray-600 dark:text-gray-300 shadow-gray-200/20 dark:shadow-black/35'
                        }`}
                        title="Ver Notificaciones de Clientes"
                    >
                        <Bell className="w-6 h-6" />
                        {activeNotificationsList.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                                {activeNotificationsList.length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {auth?.user?.is_demo_user && (
                <div className="fixed bottom-6 left-6 z-50 animate-bounce">
                    <Link
                        href={route('demo.selector')}
                        className="flex items-center gap-1.5 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-full shadow-2xl shadow-orange-500/20 border border-orange-500/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <span>🔄 Cambiar Rol Demo</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
