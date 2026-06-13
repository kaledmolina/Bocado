import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={`${className} font-sans`}>
            <header className="mb-6">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Actualizar Contraseña
                </h2>

                <p className="mt-1 text-xs text-gray-550 dark:text-gray-400">
                    Asegúrate de usar una contraseña larga y aleatoria para mantener tu cuenta protegida.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Contraseña Actual"
                        className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"
                    />

                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                        autoComplete="current-password"
                        required
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nueva Contraseña" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                        autoComplete="new-password"
                        required
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                        className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1"
                    />

                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                        autoComplete="new-password"
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-850">
                    <button
                        type="submit"
                        disabled={processing}
                        className="py-2.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-orange-500/10 hover:scale-102 active:scale-98 disabled:opacity-50"
                    >
                        Guardar Contraseña
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-bold text-emerald-650 dark:text-emerald-450">
                            ✓ Contraseña actualizada.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
