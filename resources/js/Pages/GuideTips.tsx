import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/Reveal';
import { Lightbulb, QrCode, TrendingUp, Sparkles, BookOpen, Star, Users, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function GuideTips() {
    return (
        <PublicLayout>
            <Head title="Guía y Tips de Éxito - bocado!" />
            
            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 min-h-[80vh] text-slate-800 dark:text-gray-100">
                
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-6">
                    <span className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">📖 Consejos de Crecimiento</span>
                    <h1 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 dark:text-white">Guía Básica y Tips de Éxito</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                        Claves fundamentales para cada rol dentro del ecosistema digital de **bocado!**. Descubre cómo maximizar el rendimiento y servicio.
                    </p>
                </div>

                {/* 1. SECTION: PROPIETARIO / DUEÑO */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-gray-800 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Guía para el Propietario / Administrador
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Reveal delay={100}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        📈 Análisis de Datos Activos
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Monitorea los gráficos históricos e ingresos por mesa para detectar qué zonas de tu local generan mayor facturación. Optimiza el aforo y distribución de mesas según estos reportes.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Revisa qué meseros atienden más pedidos y recompensa su productividad.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        🍲 Carta Digital de Alto Impacto
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Los platos con fotografías de buena calidad y descripciones claras aumentan el ticket promedio del cliente en un 20%. Clasifica tus productos en categorías concisas para acelerar la navegación.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Agrega ingredientes clave en la descripción para comensales con alergias.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={200}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        🛡️ Seguridad de Pedidos QR
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Utiliza el PIN dinámico de mesa obligatoriamente. Esto garantiza que únicamente los clientes físicamente presentes en la mesa puedan ordenar platillos, eliminando comandas fantasmas.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Imprime códigos QR de resolución nítida en soportes acrílicos estables.
                                </span>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* 2. SECTION: CLIENTE */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-gray-800 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Guía para el Cliente / Comensal
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Reveal delay={100}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        📱 Menú Digital en tu Mano
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Escanea el QR de la mesa para abrir el catálogo. Explora de forma autónoma los platos disponibles y arma tu carrito sin esperar a que el personal esté desocupado en momentos de alta demanda.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Puedes agregar notas especiales de cocción o retiro de ingredientes al carrito.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        🔒 Validación de PIN de Mesa
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        El PIN de 4 dígitos impreso o mostrado por el mesero es una capa de seguridad. Al ingresarlo en tu móvil, el sistema asocia de forma única tu celular con la mesa, protegiendo tus comandas de accesos indeseados.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Solicita el PIN al mesero si la mesa aún no lo tiene visible.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={200}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        💳 Cuenta Clara y Transparente
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Consulta la sección de "Consumo Acumulado" en cualquier momento de la comida para conocer el total a pagar en tiempo real. Al final, pide la cuenta con un solo toque para acelerar tu salida.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Pedir la cuenta digital ahorra hasta 10 minutos de tiempo de espera.
                                </span>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* 3. SECTION: MESERO */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-gray-800 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Star className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Guía para el Personal de Servicio (Meseros)
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Reveal delay={100}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        ⏱️ Control Operativo de Turno
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Iniciar y finalizar jornada formalmente desde el portal ayuda al administrador a verificar tus horas trabajadas y ventas. Mantener el turno activo habilita alertas sonoras de tu zona.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: No olvides dar ponche de salida para registrar tus propinas obtenidas.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={150}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        🍽️ Reducción de Tiempos de Entrega
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Supervisa constantemente el estatus de cocina. En cuanto un plato pase al estado listo en barra, entrégalo inmediatamente en mesa y márcalo como "Servido" para mantener la comida caliente.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Un servicio ágil mejora las valoraciones de los clientes en un 35%.
                                </span>
                            </div>
                        </Reveal>

                        <Reveal delay={200}>
                            <div className="p-6 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-sm hover:border-orange-500/20 hover:shadow transition-all duration-300 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                        🌟 Bolsa de Talentos Destacados
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 leading-relaxed">
                                        Tu historial de ventas acumuladas, horas de servicio y calificaciones de clientes se almacena en tu perfil. Los dueños que buscan personal consultan estas métricas antes de contratar en la Bolsa.
                                    </p>
                                </div>
                                <span className="text-[10px] text-orange-500 font-bold block border-t border-slate-100 dark:border-gray-800/50 pt-3">
                                    💡 Tip: Brinda una atención sobresaliente para acumular reseñas de 5 estrellas.
                                </span>
                            </div>
                        </Reveal>
                    </div>
                </div>

            </div>
        </PublicLayout>
    );
}
