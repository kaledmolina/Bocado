import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Building2, Users, QrCode, ArrowRight } from 'lucide-react';

export default function DemoSelector() {
    return (
        <GuestLayout>
            <Head title="Selección de Demo - bocado!" />

            <div className="mb-6 text-center animate-fade-in">
                <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full inline-block">
                    ⚡ Entorno Real con Datos Demo
                </span>
                <h2 className="text-xl font-extrabold text-gray-800 mt-3">
                    Ingresar al Sistema Real
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Selecciona el rol para acceder directamente sin contraseñas o registros.
                </p>
            </div>

            <div className="space-y-4">
                {/* 1. Owner Demo Button */}
                <a
                    href="/demo-login/owner"
                    className="group flex items-center justify-between p-4 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-500/35 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide group-hover:text-orange-600 transition-colors">
                                Propietario (Admin)
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-[200px]">
                                Controla ventas, mesas, menú y finanzas.
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>

                {/* 2. Waiter Demo Button */}
                <a
                    href="/demo-login/waiter"
                    className="group flex items-center justify-between p-4 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-500/35 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide group-hover:text-orange-600 transition-colors">
                                Mesero (Sala)
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-[200px]">
                                Toma pedidos y gestiona comandas móviles.
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>

                {/* 3. Client Demo Button */}
                <a
                    href="/demo-login/client"
                    className="group flex items-center justify-between p-4 bg-white hover:bg-orange-50/50 border border-gray-200 hover:border-orange-500/35 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                            <QrCode className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide group-hover:text-orange-600 transition-colors">
                                Cliente (Mesa QR)
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-[200px]">
                                Escanea mesa, ordena platos y ve la cuenta.
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </a>
            </div>

            <div className="text-center pt-5 border-t border-gray-150 mt-6 animate-fade-in flex justify-between items-center text-xs">
                <Link
                    href="/"
                    className="font-bold text-gray-450 hover:text-gray-650 transition-colors"
                >
                    ← Volver al inicio
                </Link>
                <Link
                    href="/login"
                    className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                >
                    Login con cuenta →
                </Link>
            </div>
        </GuestLayout>
    );
}
