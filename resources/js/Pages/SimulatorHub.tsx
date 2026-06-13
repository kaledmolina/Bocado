import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Users, QrCode, TrendingUp, ArrowRight, ShieldCheck, ClipboardList, UtensilsCrossed 
} from 'lucide-react';

export default function SimulatorHub() {
    return (
        <PublicLayout>
            <Head title="Simulador de Roles - bocado!" />
            
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 min-h-[85vh]">
                
                {/* Hero / Header Section */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-orange-500 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">
                        🎮 Entorno de Pruebas Interactivo
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Simulador por Roles bocado!
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        Experimenta de forma independiente la plataforma desde las tres perspectivas clave del negocio gastronómico. Selecciona un rol para ver su flujo de trabajo.
                    </p>
                </div>

                {/* Role Workflow Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    
                    {/* 1. Owner Workflow Card */}
                    <div className="group p-8 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-[32px] hover:border-orange-500/25 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                💼 Flujo del Propietario (Dueño)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
                                Administra el local, edita la carta y realiza el cobro final.
                            </p>
                            
                            {/* Steps list */}
                            <ul className="mt-6 space-y-3.5 text-xs text-slate-600 dark:text-gray-300">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">1</span>
                                    <span>Monitorea indicadores clave de ventas y aforo en tiempo real.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">2</span>
                                    <span>Gestiona el catálogo de platos, categorías y precios del menú.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">3</span>
                                    <span>Recibe alertas de pago, valida el consumo y realiza el cobro.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="mt-8 space-y-2.5">
                            <a
                                href="/demo-login/owner"
                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-[0.98] cursor-pointer"
                            >
                                <span>Ingresar al Sistema Real ⚡</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <Link
                                href="/simulator/owner"
                                className="w-full py-2.5 bg-slate-150/70 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-750 text-slate-700 dark:text-gray-250 font-bold rounded-2xl text-[11px] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                                <span>Probar Simulador Interactivo</span>
                            </Link>
                        </div>
                    </div>

                    {/* 2. Waiter Workflow Card */}
                    <div className="group p-8 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-[32px] hover:border-orange-500/25 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                🧑‍🍳 Flujo del Mesero
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
                                Controla turnos, toma comandas en mesa y gestiona estados.
                            </p>
                            
                            {/* Steps list */}
                            <ul className="mt-6 space-y-3.5 text-xs text-slate-600 dark:text-gray-300">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">1</span>
                                    <span>Inicia y finaliza su turno de trabajo registrando horas en vivo.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">2</span>
                                    <span>Toma pedidos directamente desde un celular tocando los platos.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">3</span>
                                    <span>Solicita el cobro final de una mesa liberando el flujo.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="mt-8 space-y-2.5">
                            <a
                                href="/demo-login/waiter"
                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-[0.98] cursor-pointer"
                            >
                                <span>Ingresar al Sistema Real ⚡</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <Link
                                href="/simulator/waiter"
                                className="w-full py-2.5 bg-slate-150/70 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-750 text-slate-700 dark:text-gray-250 font-bold rounded-2xl text-[11px] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                                <span>Probar Simulador Interactivo</span>
                            </Link>
                        </div>
                    </div>

                    {/* 3. Client Workflow Card */}
                    <div className="group p-8 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-900 rounded-[32px] hover:border-orange-500/25 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                🍽️ Flujo del Cliente
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
                                Escanea el código QR, ingresa el PIN y ordena sin esperar.
                            </p>
                            
                            {/* Steps list */}
                            <ul className="mt-6 space-y-3.5 text-xs text-slate-600 dark:text-gray-300">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">1</span>
                                    <span>Simula el escaneo de QR e ingresa el PIN de seguridad de la mesa.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">2</span>
                                    <span>Crea su carrito de compras y realiza pedidos de comida en vivo.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">3</span>
                                    <span>Consulta su cuenta actualizada y solicita cobrar con un botón.</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="mt-8 space-y-2.5">
                            <a
                                href="/demo-login/client"
                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-[0.98] cursor-pointer"
                            >
                                <span>Escanear QR de Mesa Real ⚡</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <Link
                                href="/simulator/client"
                                className="w-full py-2.5 bg-slate-150/70 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-750 text-slate-700 dark:text-gray-250 font-bold rounded-2xl text-[11px] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                                <span>Probar Simulador Interactivo</span>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Additional workflow summary / description block */}
                <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850/60 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-orange-500" />
                            ¿Cómo interactúan los simuladores?
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed max-w-xl">
                            Aunque cada simulador es ahora 100% independiente, están diseñados sobre la misma estructura de datos del restaurante. Si deseas simular un flujo continuo, puedes abrir diferentes pestañas del navegador en paralelo. Por ejemplo, añade un pedido en la pestaña del Mesero y verás cómo impacta instantáneamente en la pestaña del Dueño y del Cliente.
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link
                            href="/guide-tips"
                            className="py-2.5 px-5 bg-slate-200/80 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
                        >
                            <ClipboardList className="w-4 h-4" />
                            Ver Guía y Tips
                        </Link>
                    </div>
                </div>

            </div>
        </PublicLayout>
    );
}
