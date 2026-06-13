import { Head, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/Reveal';
import { 
    QrCode, Briefcase, Lightbulb, TrendingUp, ChevronRight,
    Utensils, ChefHat, PlusCircle, CheckCircle2, DollarSign, Smartphone, ShieldCheck
} from 'lucide-react';

interface PageProps {
    auth: {
        user: any;
    };
}

export default function Welcome({ auth }: PageProps) {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

    const steps = [
        {
            step: 1,
            title: "Creación de Mesa",
            icon: <PlusCircle className="w-5 h-5" />,
            role: "Administrador / Dueño",
            badgeColor: "bg-orange-500/10 text-orange-600",
            desc: "El dueño registra la mesa en su panel y genera su código QR con PIN de seguridad dinámico.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Panel Administrativo</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm text-xs">
                        <p className="font-bold text-slate-805 dark:text-white">✓ Mesa 5 Creada Exitosamente</p>
                        <p className="text-[10px] text-slate-400 mt-1">Token QR generado: table_tkn_8172</p>
                    </div>
                    <div className="flex justify-center py-2">
                        <QrCode className="w-16 h-16 text-orange-500 animate-bounce" />
                    </div>
                </div>
            )
        },
        {
            step: 2,
            title: "Creación de Producto",
            icon: <Utensils className="w-5 h-5" />,
            role: "Administrador / Dueño",
            badgeColor: "bg-orange-500/10 text-orange-600",
            desc: "El dueño añade platillos con precios, categorías y descripciones para actualizar el menú digital.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catálogo Digital</span>
                        <span className="text-[9px] font-bold text-orange-600 px-2 py-0.5 bg-orange-500/10 rounded-full">Carta Digital</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="font-bold">Fetuccini Alfredo con Pollo</span>
                            <span className="text-orange-500 font-extrabold">$16.500</span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal">Pasta fresca artesanal bañada en salsa crema de parmesano.</p>
                    </div>
                </div>
            )
        },
        {
            step: 3,
            title: "Cliente QR Pide",
            icon: <Smartphone className="w-5 h-5" />,
            role: "Comensal / Cliente",
            badgeColor: "bg-blue-500/10 text-blue-600",
            desc: "El cliente escanea el QR, ingresa el PIN de mesa y envía su pedido directamente a cocina.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Celular de Cliente</span>
                        <span className="text-[9px] font-bold text-blue-600 px-2 py-0.5 bg-blue-500/10 rounded-full">Mesa 5</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-gray-800 rounded-2xl shadow-sm text-center space-y-2">
                        <span className="text-xl">🛒</span>
                        <p className="text-[10px] text-slate-600 dark:text-gray-300">Enviando <strong>1x Fetuccini Alfredo</strong> a cocina...</p>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[85%] animate-pulse" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            step: 4,
            title: "Mesero Atiende",
            icon: <ChefHat className="w-5 h-5" />,
            role: "Personal / Mesero",
            badgeColor: "bg-emerald-500/10 text-emerald-650",
            desc: "El mesero visualiza el pedido, lo confirma en cocina, y opcionalmente añade platos adicionales a la comanda.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Celular de Mesero</span>
                        <span className="text-[9px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-500/10 rounded-full">Turno Activo</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Mesa 5: 1 Nuevo Autopedido</span>
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                        <p className="text-[9px] text-slate-400">Verificando comanda enviada por el cliente.</p>
                    </div>
                </div>
            )
        },
        {
            step: 5,
            title: "Mesero Sirve",
            icon: <CheckCircle2 className="w-5 h-5" />,
            role: "Personal / Mesero",
            badgeColor: "bg-emerald-500/10 text-emerald-650",
            desc: "La cocina termina el plato, y el mesero lo sirve en la mesa marcándolo como completado desde el portal.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planilla de Mesa 5</span>
                        <span className="text-[9px] font-bold text-green-600 px-2 py-0.5 bg-green-500/10 rounded-full">Entregado</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm text-center space-y-2">
                        <span className="text-2xl animate-bounce">🍽️</span>
                        <p className="text-[10px] text-slate-600 dark:text-gray-300 font-bold">Fetuccini Alfredo Servido</p>
                    </div>
                </div>
            )
        },
        {
            step: 6,
            title: "Supervisor Administra",
            icon: <DollarSign className="w-5 h-5" />,
            role: "Administrador / Dueño",
            badgeColor: "bg-orange-500/10 text-orange-600",
            desc: "El dueño visualiza las transacciones del día, califica meseros y registra el cobro de la mesa.",
            mockup: (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditoría y Reportes</span>
                        <span className="text-[9px] font-black text-green-600">Facturado</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-205 dark:border-gray-800 rounded-2xl shadow-sm space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Ingreso Generado:</span>
                            <span className="font-extrabold text-green-600">$16.500</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full" />
                        </div>
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setActiveStep(prev => (prev === 6 ? 1 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const activeStepData = steps.find(s => s.step === activeStep) || steps[0];

    return (
        <PublicLayout>
            <Head title="bocado! - Gestión de Pedidos en Tiempo Real" />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10 text-slate-800 dark:text-gray-100">
                <div className="space-y-6 max-w-xl animate-fade-in">
                    <span className="px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-widest rounded-full">
                        🚀 Toma de pedidos digital móvil
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                        Toma los pedidos de tu restaurante{' '}
                        <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                            al instante.
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">
                        Digitaliza tus mesas con códigos QR únicos. Tus meseros toman los pedidos rápidamente desde sus móviles y tus clientes visualizan su cuenta en curso en tiempo real. Cero pérdidas, máxima velocidad.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-4">
                        <Link
                            href="/register"
                            className="py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/10 transition-all text-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Comenzar Gratis
                        </Link>
                        
                        <Link
                            href={route('demo.selector')}
                            className="py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all text-sm hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-orange-600/15"
                        >
                            Demo gratis ⚡
                        </Link>
                    </div>
                </div>

                {/* 3D Floating Mockup Cards */}
                <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center perspective-1000 select-none animate-fade-in">
                    {/* Admin Dashboard Mockup Card */}
                    <div className="absolute w-[280px] sm:w-[350px] p-5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl hover-tilt-3d pointer-events-auto transition-colors duration-300 animate-float">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-gray-800 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Panel del Admin</span>
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] text-slate-500 dark:text-gray-400">Ventas Cobradas (Hoy)</p>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">$340.000</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[70%]" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Monitoreo de Mesas</p>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="p-2 bg-slate-50 dark:bg-gray-950 rounded-xl flex items-center justify-between border border-slate-100 dark:border-gray-800">
                                        <span className="text-slate-700 dark:text-gray-300 font-semibold">Mesa 1</span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-gray-950 rounded-xl flex items-center justify-between border border-amber-500/20">
                                        <span className="text-slate-700 dark:text-gray-300 font-semibold">Mesa 2</span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Waiter Mobile App Mockup Card */}
                    <div className="absolute w-[180px] sm:w-[220px] p-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-2xl hover-tilt-3d-reverse left-[60%] sm:left-[55%] top-[40%] sm:top-[30%] pointer-events-auto transition-colors duration-300 animate-float-delayed">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400">Mesa 2 (Mesero)</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        </div>
                        <div className="space-y-2.5">
                            <div className="p-2 bg-slate-50 dark:bg-gray-955/20 border border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px]">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-gray-300">Pizza Margarita</p>
                                    <p className="text-[8px] text-slate-400 dark:text-gray-500">1x (Sin cebolla)</p>
                                </div>
                                <span className="font-bold text-orange-600 dark:text-orange-400">$15.000</span>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-gray-955/20 border border-slate-100 dark:border-gray-800 flex justify-between items-center text-[10px]">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-gray-300">Coca Cola</p>
                                    <p className="text-[8px] text-slate-400 dark:text-gray-500">1x</p>
                                </div>
                                <span className="font-bold text-orange-600 dark:text-orange-400">$3.000</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-gray-800 text-[10px]">
                                <span className="text-slate-400 dark:text-gray-500 font-bold">TOTAL</span>
                                <span className="font-black text-slate-900 dark:text-white">$18.000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agile Value Proposition Section */}
            <Reveal>
                <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200 dark:border-gray-900 relative z-10 text-slate-800 dark:text-gray-100">
                    <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 border border-orange-500/20 rounded-[32px] p-8 sm:p-12 text-center space-y-6 max-w-4xl mx-auto">
                        <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full inline-block">
                            ⚡ MÁS VELOZ, SEGURO Y ORGANIZADO
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                            ¿Por qué bocado! hace tu restaurante más ágil?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            El sistema digital de <strong>bocado!</strong> reemplaza las antiguas y confusas comandas de papel. Al unificar los flujos, todo el personal opera sobre la misma información en tiempo real, aumentando la rotación de mesas y las propinas.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
                            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-gray-800 rounded-2xl space-y-2">
                                <span className="text-xl">🚀</span>
                                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Operación Ultra-Rápida</h4>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-normal">
                                    Los clientes escanean el QR y envían sus pedidos directo a cocina, liberando tiempo valioso de los meseros.
                                </p>
                            </div>
                            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-gray-800 rounded-2xl space-y-2">
                                <span className="text-xl">🔒 Seguridad por PIN</span>
                                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Filtro de Seguridad</h4>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-normal">
                                    El código PIN de mesa evita que usuarios externos envíen pedidos falsos o accedan a la información del consumo.
                                </p>
                            </div>
                            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-gray-800 rounded-2xl space-y-2">
                                <span className="text-xl">📊 Control Organizado</span>
                                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Supervisión en Vivo</h4>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-normal">
                                    El dueño visualiza estadísticas instantáneas de ticket promedio, ingresos históricos por mesa y ventas por mesero.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Lifecycle Diagram Banner Section */}
            <Reveal>
                <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200 dark:border-gray-900 relative z-10 text-slate-800 dark:text-gray-100">
                    <div className="bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:to-slate-950 rounded-[40px] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative overflow-hidden space-y-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="text-center max-w-2xl mx-auto space-y-2">
                            <span className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest block">
                                🔄 CICLO OPERATIVO INTEGRADO
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Diagrama del Flujo de Trabajo
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                Conoce cómo viaja el pedido y la información a través de los diferentes roles del sistema.
                            </p>
                        </div>

                        {/* Interactive Step Switcher */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
                            
                            {/* Left: Interactive Step Navigation List */}
                            <div className="lg:col-span-5 space-y-2">
                                {steps.map(s => (
                                    <button
                                        key={s.step}
                                        onClick={() => {
                                            setActiveStep(s.step);
                                            setIsAutoPlaying(false);
                                        }}
                                        className={`w-full p-3.5 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                                            activeStep === s.step
                                                ? 'bg-orange-500/10 border-orange-500/40 dark:border-orange-500/50 text-orange-600 dark:text-orange-400 shadow-sm scale-[1.02]'
                                                : 'bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                            activeStep === s.step 
                                                ? 'bg-orange-500 text-white' 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'
                                        }`}>
                                            {s.step}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs font-black block">{s.title}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
                                                activeStep === s.step ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {s.role}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Right: Large Mockup Box showing the step's logic */}
                            <div className="lg:col-span-7 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-[32px] min-h-[260px] flex flex-col justify-between space-y-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${activeStepData.badgeColor}`}>
                                            {activeStepData.role}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Paso {activeStep} de 6</span>
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">{activeStepData.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{activeStepData.desc}</p>
                                </div>

                                {/* Step-specific Graphic Mockup */}
                                <div className="pt-2">
                                    {activeStepData.mockup}
                                </div>
                            </div>

                        </div>

                        {/* Centered CTA to try Simulator */}
                        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                💡 El simulador avanza automáticamente cada 5 segundos. Pulsa cualquier paso para pausar e interactuar.
                            </p>
                            <Link
                                href="/simulator"
                                className="py-2 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
                            >
                                🎮 Probar Simulador Completo
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Teaser Cards Section */}
            <Reveal>
                <section className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-gray-900 relative z-10">
                    <div className="text-center max-w-xl mx-auto mb-10">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">✨ Novedades y Herramientas</span>
                        <h2 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Explora bocado!</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Accede a herramientas exclusivas diseñadas para meseros y dueños de negocio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Simulator Teaser Card */}
                        <Link 
                            href="/simulator"
                            className="group relative p-8 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950 border border-slate-200 dark:border-gray-800 rounded-[32px] cursor-pointer shadow-sm hover:shadow-xl hover:border-orange-500/35 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors">Simulador de Roles</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                                    Experimenta cómo interactúan el Propietario, el Mesero y el Cliente en tiempo real. Configura mesas, realiza pedidos rápidos y simula cobranzas de inmediato.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-xs font-extrabold text-orange-600 dark:text-orange-400">
                                Probar Simulador Gratuito 🎮 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* Job Board Teaser Card */}
                        <Link 
                            href="/job-board"
                            className="group relative p-8 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950 border border-slate-200 dark:border-gray-800 rounded-[32px] cursor-pointer shadow-sm hover:shadow-xl hover:border-orange-500/35 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors">Bolsa de Empleo</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                                    ¿Eres un mesero profesional buscando nuevas oportunidades? O ¿un restaurante en busca de talentos? Explora ofertas y postúlate directamente desde la plataforma.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-xs font-extrabold text-orange-600 dark:text-orange-400">
                                Explorar Bolsa de Trabajo 💼 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </section>
            </Reveal>

            {/* Guide and Tips Section */}
            <Reveal delay={150}>
                <section id="guia-tips" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-gray-900 relative z-10 transition-colors duration-300">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">📖 Consejos de Crecimiento</span>
                        <h2 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Guía Básica y Tips de Éxito</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Claves fundamentales para mejorar el servicio y multiplicar tus ventas utilizando la tecnología digital.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Tip 1 */}
                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-[24px] hover:border-orange-500/20 hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-1">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">Atención al Cliente Ágil</h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                    Un mesero que reduce los tiempos de toma de pedido de 10 minutos a 2 minutos puede atender hasta un 40% más de clientes en horas pico. Mantén la aplicación abierta y registra al instante.
                                </p>
                            </div>
                            <span className="text-[10px] text-orange-500 font-bold mt-4 block">💡 Tip: Agrega los pedidos rápidamente desde el panel de mesero.</span>
                        </div>

                        {/* Tip 2 */}
                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-[24px] hover:border-orange-500/20 hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-1">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">Optimización QR en Mesa</h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                    Coloca los códigos QR en portamenús acrílicos visibles y limpios. Explica al cliente que puede escanearlo para ver su cuenta en vivo, lo que reduce la ansiedad de espera y la carga de trabajo.
                                </p>
                            </div>
                            <span className="text-[10px] text-orange-500 font-bold mt-4 block">💡 Tip: Imprime en alta definición para un escaneo fluido.</span>
                        </div>

                        {/* Tip 3 */}
                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-[24px] hover:border-orange-500/20 hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-1">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">Maximización de Rotación</h4>
                                <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                    Al habilitar que el cliente pida la cuenta desde el QR, la mesa se libera un promedio de 12 minutos más rápido. Esto incrementa de forma directa las ventas de tu restaurante en días de alta afluencia.
                                </p>
                            </div>
                            <span className="text-[10px] text-orange-500 font-bold mt-4 block">💡 Tip: Revisa la métrica de ocupación en la Consola del Dueño.</span>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Testimonials Section */}
            <Reveal>
                <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-gray-900 relative z-10 text-slate-800 dark:text-gray-150">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">🗣️ Opiniones Reales</span>
                        <h2 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Lo que dicen los restauradores</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Descubre cómo bocado! está transformando la operación diaria de locales gastronómicos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-6 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-[32px] flex flex-col justify-between shadow-sm relative">
                            <span className="text-5xl text-orange-500/10 absolute top-4 right-6 font-serif">“</span>
                            <div className="space-y-4">
                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                    ★ ★ ★ ★ ★
                                </div>
                                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed italic">
                                    "Aumentamos la rotación de nuestras mesas en un 25% la primera semana. Los clientes adoran poder ver su cuenta en tiempo real y pedir directo desde el QR sin esperar al mesero."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 font-black flex items-center justify-center text-xs">
                                    AG
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Alejandro Gómez</h4>
                                    <p className="text-[9px] text-slate-400">Dueño de La Piazzetta</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-6 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-[32px] flex flex-col justify-between shadow-sm relative">
                            <span className="text-5xl text-orange-500/10 absolute top-4 right-6 font-serif">“</span>
                            <div className="space-y-4">
                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                    ★ ★ ★ ★ ★
                                </div>
                                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed italic">
                                    "El PIN dinámico de seguridad nos salvó de bromas y pedidos falsos. El sistema de caja y el control de turnos de meseros le dio un orden a mi negocio que antes no tenía."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 font-black flex items-center justify-center text-xs">
                                    MR
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Mariana Rodríguez</h4>
                                    <p className="text-[9px] text-slate-400">Gerente de Rinconcito Gastronómico</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-6 bg-white dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-[32px] flex flex-col justify-between shadow-sm relative">
                            <span className="text-5xl text-orange-500/10 absolute top-4 right-6 font-serif">“</span>
                            <div className="space-y-4">
                                <div className="flex items-center gap-1 text-amber-500 text-sm">
                                    ★ ★ ★ ★ ★
                                </div>
                                <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed italic">
                                    "Nuestros meseros atienden el doble de rápido y ganan más propinas porque la aplicación móvil es facilísima de usar. Ya no perdemos comandas de papel."
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 font-black flex items-center justify-center text-xs">
                                    CH
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Carlos Herrera</h4>
                                    <p className="text-[9px] text-slate-400">Socio Fundador de Café Central</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* Pricing Section */}
            <Reveal>
                <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-gray-900 relative z-10 text-slate-800 dark:text-gray-150">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">💎 Planes y Precios</span>
                        <h2 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Tarifas Transparentes</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Elige el plan ideal para tu negocio. Registrate hoy y aprovecha nuestras ofertas de lanzamiento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Free Lite Card */}
                        <div className="bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-[32px] p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:border-slate-300 dark:hover:border-gray-700">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Básico</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Free Lite</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 min-h-[32px]">
                                    Perfecto para pequeños cafés o food trucks.
                                </p>
                                
                                <div className="my-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                                        <span className="text-xs text-slate-400 font-medium"> / para siempre</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 opacity-0 select-none">-</p>
                                </div>

                                <ul className="space-y-3.5 text-xs border-t border-slate-100 dark:border-gray-800 pt-6">
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Hasta 5 mesas activas</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Generador de QRs y PINs</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Menú digital básico</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">1 cuenta de administrador</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-8">
                                <Link 
                                    href="/register" 
                                    className="w-full text-center inline-block py-3 px-6 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-black rounded-2xl transition-all"
                                >
                                    Empezar Ahora
                                </Link>
                            </div>
                        </div>

                        {/* Pro Ilimitado Card (Recommended) */}
                        <div className="bg-white dark:bg-gray-900 border-2 border-orange-500 rounded-[32px] p-8 flex flex-col justify-between shadow-xl relative transition-all duration-300 hover:scale-[1.01] overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                                PROMO GRATIS
                            </div>
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">Recomendado</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Pro Ilimitado</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 min-h-[32px]">
                                    Ideal para restaurantes con flujo constante.
                                </p>
                                
                                <div className="my-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-orange-600 dark:text-orange-400">$0</span>
                                        <span className="text-sm text-slate-400 line-through font-medium">$29.900</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-2">
                                        Gratis primeros clientes
                                    </p>
                                </div>

                                <ul className="space-y-3.5 text-xs border-t border-slate-100 dark:border-gray-800 pt-6">
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Mesas ilimitadas</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Generador de QRs ilimitado</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Menú digital avanzado e imágenes</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Cuentas de meseros ilimitadas</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Estadísticas y control de caja</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Bolsa de empleo vinculada</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-8">
                                <Link 
                                    href="/register" 
                                    className="w-full text-center inline-block py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-500/10 transition-all"
                                >
                                    Obtener Gratis por Tiempo Limitado
                                </Link>
                            </div>
                        </div>

                        {/* Enterprise Card */}
                        <div className="bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-[32px] p-8 flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:border-slate-300 dark:hover:border-gray-700">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Grandes Locales</span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Enterprise</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 min-h-[32px]">
                                    Para cadenas o franquicias multi-sucursal.
                                </p>
                                
                                <div className="my-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                                        <span className="text-sm text-slate-400 line-through font-medium">$89.900</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold mt-2">
                                        Apertura Gratuita
                                    </p>
                                </div>

                                <ul className="space-y-3.5 text-xs border-t border-slate-100 dark:border-gray-800 pt-6">
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Multi-sucursal integrado</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Soporte VIP personalizado</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Integraciones API POS de terceros</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span className="text-slate-600 dark:text-gray-300">Exportación a Excel/PDF avanzada</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-8">
                                <Link 
                                    href="/register" 
                                    className="w-full text-center inline-block py-3 px-6 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-black rounded-2xl transition-all"
                                >
                                    Registrar Sucursal Gratis
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>
            </Reveal>

            {/* FAQ Section */}
            <Reveal>
                <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-gray-900 relative z-10 text-slate-800 dark:text-gray-150">
                    <div className="text-center max-w-xl mx-auto mb-16">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">❓ Dudas Frecuentes</span>
                        <h2 className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Preguntas Frecuentes</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Resolvemos las inquietudes principales sobre el uso del sistema.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "¿Necesito comprar tabletas o pantallas costosas para mi local?",
                                a: "No. bocado! está diseñado de forma móvil y responsiva. Tus meseros pueden utilizar sus propios smartphones personales para registrar pedidos, y tus clientes usan su celular para escanear el código QR."
                            },
                            {
                                q: "¿Cómo se imprimen y colocan los códigos QR en las mesas?",
                                a: "Dentro del panel de administración puedes crear mesas en segundos. Al guardarlas, el sistema genera automáticamente un código QR individual listo para imprimir en formato de mesa física. Puedes pegarlos directamente o usarlos en portamenús acrílicos."
                            },
                            {
                                q: "¿Qué sucede si no hay conexión a internet estable en mi restaurante?",
                                a: "Dado que el sistema sincroniza comandas en tiempo real, se requiere internet móvil o WiFi para operar la base de datos de pedidos de manera instantánea. Es recomendable contar con una red básica compartida para el personal de meseros."
                            },
                            {
                                q: "¿El sistema es realmente gratuito por tiempo limitado?",
                                a: "Sí. Para ayudar a impulsar los primeros restaurantes, ofrecemos el Plan Pro Ilimitado de forma totalmente gratuita por tiempo limitado. Al registrarte hoy no tendrás costos operativos mensuales ni comisiones."
                            },
                            {
                                q: "¿El PIN de mesa es obligatorio para el cliente?",
                                a: "El uso de PIN es configurable por el administrador. Sirve como un filtro de seguridad robusto para que solo comensales físicos sentados en la mesa puedan emitir pedidos falsos o visualizar el consumo en curso."
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="p-6 bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-3xl space-y-2">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{faq.q}</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* Features section */}
            <Reveal delay={200}>
                <section className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-gray-900 space-y-12 relative z-10 transition-colors duration-300">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider">⚡ Ventajas de bocado!</span>
                        <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">Creado para el Ritmo Real del Restaurante</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Olvídate de sistemas complicados. bocado! es tan rápido y sencillo que tu personal no requiere capacitación para usarlo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-3xl hover:border-orange-500/20 hover:shadow-md transition-all hover:-translate-y-1">
                            <span className="text-2xl">📱</span>
                            <h4 className="font-bold mt-3 text-slate-900 dark:text-white">Interfaz Ultra-Móvil</h4>
                            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 leading-relaxed">
                                Diseñado específicamente para verse y operar en cualquier teléfono de meseros de gama baja y alta de forma fluida.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-3xl hover:border-orange-500/20 hover:shadow-md transition-all hover:-translate-y-1">
                            <span className="text-2xl">⚡ Cuentas Claras</span>
                            <h4 className="font-bold mt-3 text-slate-900 dark:text-white">Sincronización en Vivo</h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                                El mesero guarda un pedido y el administrador ve el incremento financiero en el acto. Los clientes escanean el QR y ven lo mismo.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-3xl hover:border-orange-500/20 hover:shadow-md transition-all hover:-translate-y-1">
                            <span className="text-2xl">🖨️ Códigos QR Generados</span>
                            <h4 className="font-bold mt-3 text-slate-900 dark:text-white">Códigos QR Listos para Imprimir</h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Crea una mesa, descarga el código QR autogenerado directamente en formato para imprimir y pégalo en la mesa física.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-3xl hover:border-orange-500/20 hover:shadow-md transition-all hover:-translate-y-1">
                            <span className="text-2xl">📊 Reportes por Mesero</span>
                            <h4 className="font-bold mt-3 text-slate-900 dark:text-white">Control de Ventas Analítico</h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                                Visualiza estadísticas de ventas totales clasificadas por mesero para ver el rendimiento individual y la facturación de cada mesa.
                            </p>
                        </div>
                    </div>
                </section>
            </Reveal>
        </PublicLayout>
    );
}
