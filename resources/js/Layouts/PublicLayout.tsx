import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Briefcase, QrCode, BookOpen, Menu, X, ChevronRight, HelpCircle, UtensilsCrossed, Terminal, Sun, Moon 
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    role: string;
    restaurant_id: number | null;
}

interface PageProps {
    auth: {
        user: User | null;
    };
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<any>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
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

    // Listen for scroll events to trigger subtle floating navbar animation
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Helper to determine active link
    const currentPath = window.location.pathname;
    const isActive = (path: string) => currentPath === path;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden bg-mesh-radial transition-colors duration-300">
            {/* Glowing blur effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Header - Full-width Sticky Header */}
            <div className="sticky top-0 z-50 w-full transition-all duration-300">
                <header className={`backdrop-blur-xl border-b flex items-center justify-between px-6 transition-all duration-300 ${
                    scrolled 
                        ? 'py-3 bg-white/95 dark:bg-slate-950/95 border-orange-500/20 dark:border-orange-500/30 shadow-md shadow-orange-500/5' 
                        : 'py-4.5 bg-white/90 dark:bg-slate-950/90 border-slate-200/80 dark:border-slate-800/80 shadow-sm'
                }`}>
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 select-none group">
                            <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-transform duration-300">
                                bocado!
                            </span>
                        </Link>
                        
                        {/* Desktop Navigation Links with animated underlines */}
                        <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <Link 
                                href="/job-board"
                                className={`transition-all duration-200 flex items-center gap-1.5 relative py-1 ${
                                    isActive('/job-board') 
                                        ? 'text-orange-500' 
                                        : 'hover:text-orange-500'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4 text-orange-500" />
                                Bolsa de Empleo
                                {isActive('/job-board') && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade-in" />
                                )}
                            </Link>
                            <Link 
                                href="/simulator"
                                className={`transition-all duration-200 flex items-center gap-1.5 relative py-1 ${
                                    isActive('/simulator') 
                                        ? 'text-orange-500' 
                                        : 'hover:text-orange-500'
                                    }`}
                            >
                                <QrCode className="w-4 h-4 text-orange-500" />
                                Simulador Interactivo
                                {isActive('/simulator') && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade-in" />
                                )}
                            </Link>
                            <Link 
                                href="/guide-tips"
                                className={`transition-all duration-200 flex items-center gap-1.5 relative py-1 ${
                                    isActive('/guide-tips') 
                                        ? 'text-orange-500' 
                                        : 'hover:text-orange-500'
                                    }`}
                            >
                                <BookOpen className="w-4 h-4 text-orange-500" />
                                Guía y Tips
                                {isActive('/guide-tips') && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade-in" />
                                )}
                            </Link>
                            <Link 
                                href="/api-docs"
                                className={`transition-all duration-200 flex items-center gap-1.5 relative py-1 ${
                                    isActive('/api-docs') 
                                        ? 'text-orange-500' 
                                        : 'hover:text-orange-500'
                                    }`}
                            >
                                <Terminal className="w-4 h-4 text-orange-500" />
                                API Docs
                                {isActive('/api-docs') && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-fade-in" />
                                )}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            type="button"
                            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900 rounded-xl transition-all"
                            title="Cambiar tema"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Moon className="w-4 h-4 text-indigo-500" />
                            )}
                        </button>

                        {/* Desktop Auth Links */}
                        <div className="hidden sm:flex items-center gap-4">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/10 transition-all hover:shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Ir al Panel
                                </Link>                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 hover:text-slate-950 dark:text-gray-300 dark:hover:text-white text-xs font-black rounded-xl transition-all"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Registrar mi Restaurante
                                    </Link>
                                </>
                            )}
                        </div>
 
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 md:hidden text-slate-650 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </header>
 
                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                <div className="absolute top-[75px] inset-x-4 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/50 p-6 flex flex-col gap-5 shadow-2xl rounded-3xl md:hidden animate-slide-down text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-350">
                        <Link 
                            href="/job-board"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 py-1 text-left ${isActive('/job-board') ? 'text-orange-500' : 'hover:text-orange-500'}`}
                        >
                            <Briefcase className="w-4.5 h-4.5 text-orange-500" />
                            Bolsa de Empleo
                        </Link>
                        <Link 
                            href="/simulator"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 py-1 text-left ${isActive('/simulator') ? 'text-orange-500' : 'hover:text-orange-500'}`}
                        >
                            <QrCode className="w-4.5 h-4.5 text-orange-500" />
                            Simulador Interactivo
                        </Link>
                        <Link 
                            href="/guide-tips"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 py-1 ${isActive('/guide-tips') ? 'text-orange-500' : 'hover:text-orange-555'}`}
                        >
                            <BookOpen className="w-4.5 h-4.5 text-orange-500" />
                            Guía y Tips
                        </Link>
                        <Link 
                            href="/api-docs"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 py-1 ${isActive('/api-docs') ? 'text-orange-500' : 'hover:text-orange-555'}`}
                        >
                            <Terminal className="w-4.5 h-4.5 text-orange-500" />
                            API Docs
                        </Link>
                        <button
                            onClick={toggleTheme}
                            type="button"
                            className="flex items-center justify-between w-full py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-left border border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                        >
                            <span className="flex items-center gap-3">
                                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
                                Modo {theme === 'dark' ? 'Claro' : 'Oscuro'}
                            </span>
                        </button>
                        <div className="pt-4 border-t border-slate-100 dark:border-gray-900 flex flex-col gap-3">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs text-center font-bold rounded-xl shadow-md"
                                >
                                    Ir al Panel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white text-xs text-center font-black rounded-xl transition-all"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs text-center font-black rounded-xl shadow-md transition-all"
                                    >
                                        Registrar mi Restaurante
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Slot */}
            <main className="relative z-10 pt-4">
                {children}
            </main>

            {/* Premium Multi-column Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-gray-900/50 py-16 relative z-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                            bocado!
                        </span>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                            La plataforma de gestión y toma de pedidos en tiempo real líder para restaurantes dinámicos. Digitaliza, optimiza y vende más.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-xs text-slate-500 dark:text-gray-400">
                            <li>
                                <Link href="/" className="hover:text-orange-500 transition-colors">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/job-board" className="hover:text-orange-500 transition-colors">Bolsa de Empleo</Link>
                            </li>
                            <li>
                                <Link href="/simulator" className="hover:text-orange-500 transition-colors">Simulador de Roles</Link>
                            </li>
                             <li>
                                <Link href="/guide-tips" className="hover:text-orange-500 transition-colors">Guía Básica y Tips</Link>
                            </li>
                            <li>
                                <Link href="/api-docs" className="hover:text-orange-500 transition-colors">Documentación de API</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Comunidad y Soporte</h4>
                        <ul className="space-y-2 text-xs text-slate-500 dark:text-gray-400">
                            <li className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-pointer">
                                <HelpCircle className="w-4 h-4 text-orange-500" /> Ayuda & FAQ
                            </li>
                            <li className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-pointer">
                                <UtensilsCrossed className="w-4 h-4 text-orange-500" /> Registro de Locales
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contacto</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                            ¿Tienes dudas? Escríbenos a <a href="mailto:soporte@bocado.app" className="text-orange-500 hover:underline">soporte@bocado.app</a> o llámanos para una asesoría directa.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-slate-100 dark:border-gray-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-gray-500">
                    <p>© {new Date().getFullYear()} bocado!. Todos los derechos reservados.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Términos de Servicio</a>
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Privacidad</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
