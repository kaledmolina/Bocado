import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/Reveal';
import {
    Users, QrCode, TrendingUp, ArrowRight, ArrowLeft, ShieldCheck,
    ClipboardList, Zap, Monitor, Smartphone, ChefHat, DollarSign,
    Clock, Wifi, Play, Sparkles
} from 'lucide-react';

export default function SimulatorHub() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const roles = [
        {
            id: 'owner',
            icon: TrendingUp,
            emoji: '💼',
            title: 'Flujo del Propietario',
            subtitle: 'Dueño / Admin',
            accent: 'orange',
            gradient: 'from-orange-500 to-amber-500',
            bgGlow: 'bg-orange-500/5',
            iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
            border: 'hover:border-orange-500/30',
            description: 'Administra el local, edita la carta y realiza el cobro final.',
            steps: [
                { icon: Monitor, text: 'Monitorea indicadores clave de ventas y aforo en tiempo real.' },
                { icon: ClipboardList, text: 'Gestiona el catálogo de platos, categorías y precios del menú.' },
                { icon: DollarSign, text: 'Recibe alertas de pago, valida el consumo y realiza el cobro.' },
            ],
            realLink: '/demo-login/owner',
            realLabel: 'Ingresar al Sistema Real',
            simLink: '/simulator/owner',
        },
        {
            id: 'waiter',
            icon: Users,
            emoji: '🧑‍🍳',
            title: 'Flujo del Mesero',
            subtitle: 'Personal de Sala',
            accent: 'emerald',
            gradient: 'from-emerald-500 to-teal-500',
            bgGlow: 'bg-emerald-500/5',
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            border: 'hover:border-emerald-500/30',
            description: 'Controla turnos, toma comandas en mesa y gestiona estados.',
            steps: [
                { icon: Clock, text: 'Inicia y finaliza su turno de trabajo registrando horas en vivo.' },
                { icon: ChefHat, text: 'Toma pedidos directamente desde un celular tocando los platos.' },
                { icon: DollarSign, text: 'Solicita el cobro final de una mesa liberando el flujo.' },
            ],
            realLink: '/demo-login/waiter',
            realLabel: 'Ingresar al Sistema Real',
            simLink: '/simulator/waiter',
        },
        {
            id: 'client',
            icon: QrCode,
            emoji: '🍽️',
            title: 'Flujo del Cliente',
            subtitle: 'Comensal / Mesa QR',
            accent: 'blue',
            gradient: 'from-blue-500 to-indigo-500',
            bgGlow: 'bg-blue-500/5',
            iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            border: 'hover:border-blue-500/30',
            description: 'Escanea el código QR, ingresa el PIN y ordena sin esperar.',
            steps: [
                { icon: QrCode, text: 'Simula el escaneo de QR e ingresa el PIN de seguridad de la mesa.' },
                { icon: Smartphone, text: 'Crea su carrito de compras y realiza pedidos de comida en vivo.' },
                { icon: ShieldCheck, text: 'Consulta su cuenta actualizada y solicita cobrar con un botón.' },
            ],
            realLink: '/demo-login/client',
            realLabel: 'Escanear QR de Mesa Real',
            simLink: '/simulator/client',
        },
    ];

    const features = [
        { icon: Zap, label: '100% Interactivo', desc: 'Datos en tiempo real' },
        { icon: Wifi, label: 'Sincronizado', desc: 'Cambios al instante' },
        { icon: ShieldCheck, label: 'Sin Riesgos', desc: 'Entorno de pruebas' },
        { icon: Smartphone, label: 'Multi-dispositivo', desc: 'Móvil y escritorio' },
    ];

    return (
        <PublicLayout>
            <Head title="Simulador de Roles - bocado!" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-14 min-h-[85vh] relative">

                {/* Hero / Header Section */}
                <div className="text-center max-w-3xl mx-auto space-y-5 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <span className="relative inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-widest rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        Entorno de Pruebas Interactivo
                    </span>
                    <h1 className="relative text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Simulador por Roles{' '}
                        <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                            bocado!
                        </span>
                    </h1>
                    <p className="relative text-sm sm:text-base text-slate-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        Experimenta de forma independiente la plataforma desde las tres perspectivas clave del negocio gastronómico. Selecciona un rol para ver su flujo de trabajo.
                    </p>

                    {/* Features strip */}
                    <div className="relative flex flex-wrap justify-center gap-3 pt-2">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl text-[10px] font-bold text-slate-600 dark:text-gray-300 shadow-sm">
                                <f.icon className="w-3.5 h-3.5 text-orange-500" />
                                <span>{f.label}</span>
                                <span className="text-slate-300 dark:text-gray-600">·</span>
                                <span className="text-slate-400 dark:text-gray-500 font-medium">{f.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Role Workflow Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {roles.map((role, idx) => {
                        const Icon = role.icon;
                        const isHovered = hoveredCard === role.id;
                        return (
                            <Reveal key={role.id} delay={idx * 100}>
                                <div
                                    onMouseEnter={() => setHoveredCard(role.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className={`group relative p-7 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[28px] ${role.border} hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden`}
                                >
                                    {/* Glow accent */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${role.bgGlow} rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-40'}`} />

                                    <div className="relative">
                                        {/* Icon + role badge */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`w-12 h-12 rounded-2xl ${role.iconBg} flex items-center justify-center font-bold group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${role.gradient} text-white shadow-sm`}>
                                                {role.subtitle}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>{role.emoji}</span>
                                            {role.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                            {role.description}
                                        </p>

                                        {/* Steps list */}
                                        <ul className="mt-5 space-y-3 text-xs text-slate-600 dark:text-gray-300">
                                            {role.steps.map((step, si) => {
                                                const StepIcon = step.icon;
                                                return (
                                                    <li key={si} className="flex items-start gap-2.5">
                                                        <span className={`w-6 h-6 rounded-lg ${role.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`} style={{ transitionDelay: `${si * 50}ms` }}>
                                                            <StepIcon className="w-3 h-3" />
                                                        </span>
                                                        <span className="leading-relaxed pt-0.5">{step.text}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>

                                    {/* CTA buttons */}
                                    <div className="relative mt-7 space-y-2">
                                        <a
                                            href={role.realLink}
                                            className={`w-full py-3 bg-gradient-to-r ${role.gradient} hover:shadow-lg text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer group-hover:shadow-md`}
                                        >
                                            <span>{role.realLabel}</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            <span className="ml-0.5">⚡</span>
                                        </a>
                                        <Link
                                            href={role.simLink}
                                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold rounded-2xl text-[11px] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                                        >
                                            <Play className="w-3 h-3" />
                                            Probar Simulador Interactivo
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>

                {/* How simulators connect - Flow diagram */}
                <Reveal>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">🔄 Flujo Conectado</span>
                            <h2 className="text-2xl font-black mt-2 text-slate-900 dark:text-white">¿Cómo interactúan los roles?</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1.5">
                                Cada simulador es independiente, pero comparten la misma estructura de datos del restaurante.
                            </p>
                        </div>

                        {/* Visual flow */}
                        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-gray-800 rounded-[28px] p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Owner node */}
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shadow-sm">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 dark:text-gray-200 uppercase">Dueño</span>
                                    <span className="text-[9px] text-slate-400 max-w-[80px]">Cobra y monitorea</span>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center gap-1 text-slate-300 dark:text-gray-700">
                                    <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-orange-300 to-emerald-300 dark:from-orange-700 dark:to-emerald-700" />
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg whitespace-nowrap">Datos en vivo</span>
                                    <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-emerald-300 to-blue-300 dark:from-emerald-700 dark:to-blue-700" />
                                </div>

                                {/* Waiter node */}
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                                        <ChefHat className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 dark:text-gray-200 uppercase">Mesero</span>
                                    <span className="text-[9px] text-slate-400 max-w-[80px]">Toma pedidos</span>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center gap-1 text-slate-300 dark:text-gray-700">
                                    <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-emerald-300 to-blue-300 dark:from-emerald-700 dark:to-blue-700" />
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg whitespace-nowrap">QR + PIN</span>
                                    <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-blue-300 to-indigo-300 dark:from-blue-700 dark:to-indigo-700" />
                                </div>

                                {/* Client node */}
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-sm">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 dark:text-gray-200 uppercase">Cliente</span>
                                    <span className="text-[9px] text-slate-400 max-w-[80px]">Escanea y pide</span>
                                </div>
                            </div>

                            {/* Tip box */}
                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-gray-800">
                                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-gray-800">
                                    <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 dark:text-white">Simulación en paralelo</h4>
                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1">
                                            Abre diferentes pestañas del navegador en paralelo. Por ejemplo, añade un pedido en la pestaña del Mesero y verás cómo impacta instantáneamente en la pestaña del Dueño y del Cliente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Bottom CTA */}
                <Reveal>
                    <div className="max-w-4xl mx-auto p-6 rounded-[28px] bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-orange-500/5 border border-orange-500/15 flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                    ¿Necesitas ayuda con el simulador?
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed max-w-md">
                                    Revisa la guía completa con tips de éxito para cada rol antes de empezar.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/guide-tips"
                            className="shrink-0 py-2.5 px-6 bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-gray-700 hover:border-orange-500/30 text-slate-700 dark:text-gray-200 hover:text-orange-600 text-xs font-black rounded-2xl transition-all inline-flex items-center gap-2 active:scale-[0.98]"
                        >
                            <ClipboardList className="w-4 h-4" />
                            Ver Guía y Tips
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </Reveal>

            </div>
        </PublicLayout>
    );
}
