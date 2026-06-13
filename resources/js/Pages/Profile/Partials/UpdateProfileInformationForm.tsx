import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user as any;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || '',
            address: user.address || '',
            birthday: user.birthday || '',
            bio: user.bio || '',
            skills: user.skills || '',
            experience_description: user.experience_description || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true
        });
    };

    return (
        <section className={`${className} font-sans`}>
            <header className="mb-6">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Información del Perfil
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Actualiza la información básica de tu cuenta, contacto, dirección y perfil profesional.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nombre Completo" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="name"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />

                        <InputError className="mt-1.5" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Correo Electrónico" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="email"
                            type="email"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-1.5" message={errors.email} />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Número de Teléfono" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="phone"
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Ej. +54 9 11 2345-6789"
                        />

                        <InputError className="mt-1.5" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel htmlFor="city" value="Ciudad" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="city"
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Ej. Buenos Aires"
                        />

                        <InputError className="mt-1.5" message={errors.city} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="address" value="Dirección Física" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="address"
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Ej. Av. Corrientes 1234, CABA"
                        />

                        <InputError className="mt-1.5" message={errors.address} />
                    </div>

                    <div>
                        <InputLabel htmlFor="birthday" value="Fecha de Nacimiento" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="birthday"
                            type="date"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.birthday}
                            onChange={(e) => setData('birthday', e.target.value)}
                        />

                        <InputError className="mt-1.5" message={errors.birthday} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="skills" value="Habilidades / Especialidades" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <input
                            id="skills"
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs"
                            value={data.skills}
                            onChange={(e) => setData('skills', e.target.value)}
                            placeholder="Ej. Coctelería, Servicio de vinos, Inglés intermedio, Manejo de bandeja"
                        />

                        <InputError className="mt-1.5" message={errors.skills} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="bio" value="Biografía / Presentación Corta" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <textarea
                            id="bio"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs h-20 resize-none"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            placeholder="Cuéntanos un poco sobre ti, tu actitud y tu forma de trabajar..."
                            maxLength={500}
                        />

                        <InputError className="mt-1.5" message={errors.bio} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="experience_description" value="Experiencia Laboral Externa" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" />

                        <textarea
                            id="experience_description"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-850 text-xs h-24 resize-none"
                            value={data.experience_description}
                            onChange={(e) => setData('experience_description', e.target.value)}
                            placeholder="Describe brevemente tus trabajos anteriores como mesero (restaurantes, tiempo trabajado, responsabilidades)..."
                            maxLength={800}
                        />

                        <InputError className="mt-1.5" message={errors.experience_description} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs">
                        <p className="text-gray-800 dark:text-gray-200">
                            Tu dirección de correo electrónico no está verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 font-bold ml-1.5"
                            >
                                Haz clic aquí para volver a enviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-bold text-emerald-600 dark:text-emerald-450">
                                Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-850">
                    <button
                        type="submit"
                        disabled={processing}
                        className="py-2.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-orange-500/10 hover:scale-102 active:scale-98 disabled:opacity-50"
                    >
                        Guardar Cambios
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-bold text-emerald-650 dark:text-emerald-450">
                            ✓ Guardado con éxito.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
