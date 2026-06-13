import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface Props {
    restaurantName: string;
    token: string;
}

export default function Register({ restaurantName, token }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('waiter.invite.register', { token }), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registro de Mesero" />

            <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-3xl mx-auto mb-4 hover:scale-105 transition-all">
                    p!
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Registro de Mesero</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                    Activa tu cuenta de mesero para el restaurante:
                </p>
                <p className="text-sm font-black text-orange-600 dark:text-orange-400 mt-1">
                    {restaurantName}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nombre Completo" />
                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-2xl"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-2xl"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Contraseña" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-2xl"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-2xl"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                        disabled={processing}
                    >
                        Activar Cuenta de Mesero
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
