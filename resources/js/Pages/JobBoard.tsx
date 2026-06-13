import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/Reveal';
import { Search, Briefcase, MapPin, Phone, CheckCircle } from 'lucide-react';

interface HiringRestaurant {
    id: number;
    name: string;
    address: string;
    phone: string;
    is_hiring: boolean;
}

interface PageProps {
    auth: {
        user: any;
    };
    hiringRestaurants?: HiringRestaurant[];
    myApplications?: number[];
}

export default function JobBoard({ auth, hiringRestaurants = [], myApplications = [] }: PageProps) {
    const [jobSearch, setJobSearch] = useState('');

    const filteredRestaurants = hiringRestaurants.filter(r => 
        r.name.toLowerCase().includes(jobSearch.toLowerCase()) || 
        r.address.toLowerCase().includes(jobSearch.toLowerCase())
    );

    return (
        <PublicLayout>
            <Head title="Bolsa de Empleo - bocado!" />
            
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-10 min-h-[70vh]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-gray-900 animate-fade-in">
                    <div>
                        <span className="text-orange-655 dark:text-orange-400 text-xs font-black uppercase tracking-wider block">💼 Oportunidades Laborales</span>
                        <h1 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 dark:text-white">Bolsa de Empleo para Meseros</h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-2">
                            Explora los restaurantes activos en la plataforma que buscan personal y envíales tu postulación en un clic.
                        </p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="w-5 h-5 text-slate-405 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar restaurante o zona..."
                            value={jobSearch}
                            onChange={(e) => setJobSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-850 text-xs rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100 shadow-sm"
                        />
                    </div>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <Reveal>
                        <div className="p-16 text-center bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-850 rounded-[32px] flex flex-col items-center">
                            <Briefcase className="w-14 h-14 text-slate-405/20 mb-4 animate-pulse" />
                            <h4 className="font-bold text-slate-750 dark:text-gray-300 text-sm">No se encontraron ofertas de empleo</h4>
                            <p className="text-xs text-slate-500 mt-1">Vuelve a consultar más tarde o intenta otra búsqueda.</p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRestaurants.map((restaurant, idx) => {
                            const hasApplied = myApplications.includes(restaurant.id);
                            const isWaiter = auth.user?.role === 'waiter';
                            const isLinked = auth.user?.restaurant_id !== null;

                            const handleApply = () => {
                                if (!auth.user) {
                                    router.visit(route('login'));
                                    return;
                                }
                                if (!isWaiter) {
                                    alert('Debes iniciar sesión con una cuenta de mesero para postularte.');
                                    return;
                                }
                                if (isLinked) {
                                    alert('Ya perteneces a un restaurante. Debes desvincularte primero.');
                                    return;
                                }
                                router.post(route('waiter.apply', restaurant.id), {}, {
                                    preserveScroll: true
                                });
                            };

                            return (
                                <Reveal key={restaurant.id} delay={idx * 100}>
                                    <div className="p-8 bg-white dark:bg-gray-900/30 border border-slate-200 dark:border-gray-900 rounded-[32px] hover:border-orange-500/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-sm h-full">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{restaurant.name}</h4>
                                                <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                    Buscando
                                                </span>
                                            </div>

                                            <div className="space-y-2 pt-2 text-xs text-slate-550 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate">{restaurant.address}</span>
                                                </div>
                                                {restaurant.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                        <span>{restaurant.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-gray-900/50 mt-6">
                                            {hasApplied ? (
                                                <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5">
                                                    <CheckCircle className="w-4.5 h-4.5" />
                                                    Ya te postulaste
                                                </div>
                                            ) : isWaiter && isLinked ? (
                                                <button
                                                    disabled
                                                    className="w-full py-3 bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 font-bold rounded-2xl text-xs cursor-not-allowed"
                                                >
                                                    Ya estás vinculado a un local
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleApply}
                                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-orange-500/10 active:scale-[0.98]"
                                                >
                                                    {auth.user ? 'Postularse como Mesero' : 'Inicia sesión para postularte'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
