import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Clock } from 'lucide-react';

export default function InvitePending() {
    return (
        <GuestLayout>
            <Head title="Registro Pendiente" />

            <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-955/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">¡Registro Exitoso!</h2>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 px-4">
                        Tu solicitud de cuenta ha sido enviada. Por favor, espera a que el administrador apruebe tu cuenta de mesero para poder iniciar sesión.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex justify-center w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-2xl font-bold text-sm shadow-sm transition-all"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
