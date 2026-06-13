import { Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Utensils, QrCode, Users, LogOut, X, Menu as MenuIcon, ClipboardList, Sun, Moon, Settings, DollarSign } from 'lucide-react';
import Toast from '@/Components/Toast';

interface Props {
    children: React.ReactNode;
    title: string;
}

export default function AdminLayout({ children, title }: Props) {
    const { auth, flash } = usePage().props as any;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col md:flex-row font-sans transition-colors duration-300">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-68 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200/80 dark:border-gray-800/80 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-350 ease-out md:static flex flex-col shadow-xl md:shadow-none`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
                            b!
                        </div>
                        <div>
                            <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight leading-none">
                                bocado!
                            </h1>
                            <p className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">
                                {auth.user.restaurant?.name || 'Administración'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {[
                        { href: route('dashboard'), icon: LayoutDashboard, label: 'Dashboard', active: route().current('dashboard') },
                        { href: route('admin.products'), icon: Utensils, label: 'Menú / Platos', active: route().current('admin.products') },
                        { href: route('admin.tables'), icon: QrCode, label: 'Mesas & QRs', active: route().current('admin.tables') },
                        { href: route('admin.waiters'), icon: Users, label: 'Meseros', active: route().current('admin.waiters') },
                        { href: route('admin.orders'), icon: ClipboardList, label: 'Pedidos', active: route().current('admin.orders') },
                        { href: route('admin.cash'), icon: DollarSign, label: 'Caja', active: route().current('admin.cash') },
                        { href: route('admin.settings'), icon: Settings, label: 'Configuración', active: route().current('admin.settings') }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 relative group ${
                                    item.active
                                        ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/10'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border border-transparent'
                                }`}
                            >
                                {item.active && (
                                    <span className="absolute left-2 w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                                )}
                                <Icon className={`w-4 h-4 mr-3 transition-transform duration-200 group-hover:scale-110 ${item.active ? 'text-orange-500' : 'text-current'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 space-y-4">
                    <button
                        onClick={toggleTheme}
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-black rounded-2xl transition-all border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer"
                    >
                        <span>Modo {theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-500" />
                        ) : (
                            <Moon className="w-4 h-4 text-indigo-500" />
                        )}
                    </button>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                                {auth.user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 dark:text-white truncate">{auth.user.name}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-400 font-semibold truncate">{auth.user.email}</p>
                            </div>
                        </div>

                        {auth.user.actual_role === 'admin' && (
                            <Link
                                method="post"
                                href={route('admin.toggle-view-mode')}
                                as="button"
                                className="w-full flex items-center justify-between px-3 py-2 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[11px] font-black rounded-xl transition-all cursor-pointer border border-orange-200/50 dark:border-orange-900/50"
                            >
                                <span className="flex items-center gap-1.5">
                                    🧑‍🍳 Vista Mesero
                                </span>
                                <span className="text-[9px] bg-orange-600 text-white px-1.5 py-0.5 rounded-md uppercase">Admin</span>
                            </Link>
                        )}

                        <Link
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="w-full flex items-center justify-center py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 dark:text-rose-400 text-[11px] font-black rounded-xl transition-all cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-2" />
                            Cerrar Sesión
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Header Overlay */}
            {isMobileMenuOpen && (
                <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" />
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
                <header className="sticky top-0 z-30 md:static flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-950/80 md:bg-transparent md:dark:bg-transparent border-b border-gray-200/50 dark:border-gray-800/50 md:border-0 backdrop-blur-md md:backdrop-blur-none">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all shadow-sm">
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">{title}</h2>
                    </div>
                </header>

                <main className="flex-1 p-5 md:p-8 space-y-8 relative">
                    {children}
                </main>
            </div>

            {auth?.user && ['owner@rinconcito.com', 'pedro@rinconcito.com', 'maria@rinconcito.com'].includes(auth.user.email) && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-1.5 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-full shadow-2xl shadow-orange-500/20 border border-orange-500/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <span>🔄 Cambiar Rol Demo</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
