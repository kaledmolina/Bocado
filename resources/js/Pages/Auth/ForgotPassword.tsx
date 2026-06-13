import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar Contraseña - bocado!" />

            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mb-4 shadow-sm border border-orange-200/50">
                    <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    ¿Olvidaste tu contraseña?
                </h2>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xs">
                    No te preocupes. Escribe tu correo electrónico y te enviaremos un enlace de recuperación para elegir una nueva contraseña.
                </p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800 flex items-start gap-2.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="relative">
                    <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail className="w-4 h-4" />
                        </span>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-9 pr-4 py-2.5 block w-full rounded-2xl border-gray-200 text-sm focus:border-orange-500 focus:ring-orange-500 shadow-sm"
                            isFocused={true}
                            placeholder="ejemplo@restaurante.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-red-500 font-semibold" />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50"
                    disabled={processing}
                >
                    {processing ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>

                <div className="pt-2 flex justify-center">
                    <Link
                        href={route('login')}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
