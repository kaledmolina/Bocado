import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className} font-sans`}>
            <header>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Eliminar Cuenta
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Una vez que se elimine tu cuenta, todos sus recursos y datos se borrarán de forma permanente.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="py-2.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 font-black rounded-xl text-xs transition-all cursor-pointer border border-rose-200/50 dark:border-rose-900/50"
            >
                Eliminar Cuenta Permanente
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 font-sans space-y-4">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                        ¿Estás seguro de que deseas eliminar tu cuenta?
                    </h2>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Una vez que se elimine tu cuenta, todos sus recursos y datos se borrarán de forma permanente. Por favor, introduce tu contraseña para confirmar que deseas eliminarla de forma definitiva.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="sr-only"
                        />

                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full sm:w-3/4 px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            placeholder="Contraseña"
                            required
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-650/10 disabled:opacity-50"
                        >
                            Eliminar Cuenta
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
