import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Authenticated({
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as any;

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
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col font-sans transition-colors duration-250 pb-16">
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto transition-transform duration-300">
                <header className="backdrop-blur-xl border rounded-[24px] px-6 py-3.5 flex items-center justify-between transition-all duration-300 bg-white/75 dark:bg-gray-900/75 border-gray-200/50 dark:border-gray-800/80 shadow-lg shadow-gray-100/10 dark:shadow-black/25">
                    <div className="flex items-center gap-3">
                        <Link href={route('dashboard')} className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl hover:scale-105 transition-all">
                            b!
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent leading-none">
                                bocado!
                            </h1>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 font-semibold">
                                Usuario: <span className="text-gray-700 dark:text-gray-300 font-black">{user.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-750 dark:text-gray-400 dark:hover:text-gray-250 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 transition-all cursor-pointer"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                        </button>
                        
                        <Link
                            href={route('dashboard')}
                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 font-black rounded-2xl text-[11px] border border-gray-200 dark:border-gray-800 transition-all"
                        >
                            Volver al Panel
                        </Link>

                        {user.actual_role === 'admin' && (
                            <Link
                                method="post"
                                href={route('admin.toggle-view-mode')}
                                as="button"
                                className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-650 hover:to-amber-750 text-white font-black rounded-2xl text-[11px] transition-all cursor-pointer shadow-md shadow-orange-500/10 flex items-center gap-1.5"
                            >
                                Vista Admin
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

            <main className="p-6 pt-24 sm:pt-28 max-w-5xl mx-auto w-full space-y-6 flex-1 flex flex-col justify-start relative">
                {children}
            </main>

            {user && ['owner@rinconcito.com', 'pedro@rinconcito.com', 'maria@rinconcito.com'].includes(user.email) && (
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
