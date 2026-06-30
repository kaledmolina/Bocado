import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { Mail, Lock } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <div className="mb-6 text-center animate-fade-in">
                <h2 className="text-xl font-extrabold text-gray-800">
                    ¡Bienvenido de vuelta!
                </h2>
                <p className="text-xs text-gray-500 mt-1">Ingresa tus credenciales para acceder a tu cuenta.</p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-green-700 bg-green-500/10 border border-green-500/20 p-3 rounded-xl animate-fade-in">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email address */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                        autoComplete="username"
                        autoFocus
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-orange-500" />
                            Contraseña
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-[11px] font-bold text-orange-600 hover:text-orange-500 transition-colors"
                            >
                                ¿La olvidaste?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none text-sm transition-all"
                        required
                        autoComplete="current-password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center select-none cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 bg-white text-orange-600 focus:ring-orange-500/25"
                        />
                        <span className="ms-2 text-xs text-gray-500 font-medium">
                            Recordarme en este equipo
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/10 transition-all text-sm mt-6 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                >
                    {processing ? 'Iniciando sesión...' : 'Iniciar Sesión 🚀'}
                </button>

                <div className="text-center pt-5 border-t border-gray-150 mt-6 animate-fade-in">
                    <p className="text-xs text-gray-500">
                        ¿No tienes una cuenta registrada?{' '}
                        <Link
                            href={route('register')}
                            className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </form>

            {/* Quick Demo Access */}
            <div className="mt-6 p-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/40 rounded-2xl animate-fade-in">
                <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2.5 text-center">
                    ⚡ Acceso Rápido Demo (Sin Registro)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                        href="/demo-login/owner"
                        className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-gray-750 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-bold rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                    >
                        💼 Propietario Demo
                    </a>
                    <a
                        href="/demo-login/waiter"
                        className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-gray-750 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-bold rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                    >
                        🧑‍🍳 Mesero Demo
                    </a>
                    <a
                        href="/demo-login/client"
                        className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-gray-750 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 text-[11px] font-bold rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-center"
                    >
                        📱 Cliente Demo
                    </a>
                </div>
            </div>
        </GuestLayout>
    );
}
