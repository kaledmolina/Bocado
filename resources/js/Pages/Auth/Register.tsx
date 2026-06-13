import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState, useEffect } from 'react';
import { User, Mail, Lock, Briefcase, Coffee, ShieldCheck } from 'lucide-react';

export default function Register() {
    const [role, setRole] = useState<'admin' | 'waiter'>('admin');
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        restaurant_name: '',
        role: 'admin',
    });

    // Sync role state with form data
    useEffect(() => {
        setData('role', role);
        if (role === 'waiter') {
            setData((prev) => ({ ...prev, role: 'waiter', restaurant_name: '' }));
        } else {
            setData('role', 'admin');
        }
    }, [role]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Crear Cuenta" />

            <div className="mb-6 text-center animate-fade-in">
                <h2 className="text-xl font-extrabold text-gray-850">Únete a bocado!</h2>
                <p className="text-xs text-gray-500 mt-1">Registra tu cuenta y comienza a gestionar en tiempo real.</p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200/80 mb-6 gap-1.5">
                <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-transparent ${
                        role === 'admin'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/40'
                    }`}
                >
                    <Briefcase className="w-4 h-4" />
                    <span>Dueño de Restaurante</span>
                </button>
                <button
                    type="button"
                    onClick={() => setRole('waiter')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-transparent ${
                        role === 'waiter'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/40'
                    }`}
                >
                    <Coffee className="w-4 h-4" />
                    <span>Mesero / Talentos</span>
                </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        Nombre Completo
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        placeholder="Ej. Juan Pérez"
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                {/* Conditional Restaurant Name (Only for Admin) */}
                {role === 'admin' && (
                    <div className="animate-slide-down">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                            Nombre del Restaurante
                        </label>
                        <input
                            id="restaurant_name"
                            type="text"
                            name="restaurant_name"
                            value={data.restaurant_name}
                            placeholder="Ej. Trattoria Bella"
                            onChange={(e) => setData('restaurant_name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                            required={role === 'admin'}
                        />
                        <InputError message={errors.restaurant_name} className="mt-1" />
                    </div>
                )}

                {/* Email Address */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        Correo Electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="ejemplo@correo.com"
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-orange-500" />
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-orange-500" />
                        Confirmar Contraseña
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        placeholder="••••••••"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/10 transition-all text-sm mt-6 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                >
                    {processing ? 'Creando cuenta...' : 'Crear Cuenta ✨'}
                </button>

                <div className="text-center pt-5 border-t border-gray-150 mt-6 animate-fade-in">
                    <p className="text-xs text-gray-500">
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                            href={route('login')}
                            className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                        >
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
