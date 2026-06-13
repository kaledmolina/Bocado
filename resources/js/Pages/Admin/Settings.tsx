import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React from 'react';
import { Settings as SettingsIcon, ShieldAlert, Palette, Store, Bell, Check } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

interface Props {
    restaurant: {
        id: number;
        name: string;
        address: string | null;
        phone: string | null;
        security_waiter_activation: boolean;
        security_table_pin: boolean;
        security_require_physical_scan: boolean;
        waiters_can_collect_payment: boolean;
        client_can_call_waiter: boolean;
        primary_color: string;
        secondary_color: string;
        welcome_subtitle: string;
    };
}

export default function Settings({ restaurant }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        primary_color: restaurant.primary_color || '#f97316',
        secondary_color: restaurant.secondary_color || '#1e293b',
        welcome_subtitle: restaurant.welcome_subtitle || '¡Pide desde tu mesa de forma rápida!',
        security_waiter_activation: restaurant.security_waiter_activation,
        security_table_pin: restaurant.security_table_pin,
        security_require_physical_scan: restaurant.security_require_physical_scan,
        waiters_can_collect_payment: restaurant.waiters_can_collect_payment,
        client_can_call_waiter: restaurant.client_can_call_waiter,
    });

    const [audioEnabled, setAudioEnabled] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('audio_notifications');
            return stored === null ? true : stored === 'true';
        }
        return true;
    });

    const audioContextRef = React.useRef<AudioContext | null>(null);

    const initAudio = () => {
        if (typeof window === 'undefined') return;
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    React.useEffect(() => {
        const handleInteraction = () => {
            initAudio();
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    const playNotificationSound = (force = false) => {
        if (!audioEnabled && !force) return;
        try {
            initAudio();
            const ctx = audioContextRef.current;
            if (!ctx) return;
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1200, ctx.currentTime);
            
            gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.8);
            osc2.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleAudio = () => {
        const newValue = !audioEnabled;
        setAudioEnabled(newValue);
        localStorage.setItem('audio_notifications', String(newValue));
        if (newValue) {
            setTimeout(() => playNotificationSound(true), 50);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.security'), {
            preserveScroll: true,
        });
    };

    const handleToggleLocalState = (key: string) => {
        setData(key as any, !((data as any)[key]) as any);
    };

    return (
        <AdminLayout title="Configuración">
            <Head title="Configuración del Restaurante" />

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                {/* Header card */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg">Ajustes y Parámetros del Sistema</h3>
                            <p className="text-xs text-orange-100 font-medium">Personaliza el diseño de tu menú, actualiza tus datos y gestiona políticas del local.</p>
                        </div>
                    </div>
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="!bg-white !text-orange-600 hover:!bg-orange-50 active:scale-95 shadow-md py-3 px-6 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5"
                    >
                        <Check className="w-4 h-4" />
                        Guardar Ajustes
                    </PrimaryButton>
                </div>

                {/* Local Info Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <Store className="w-5 h-5 text-orange-500" />
                        <div>
                            <h4 className="font-extrabold text-sm text-gray-950 dark:text-white">Datos del Establecimiento</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Configura el nombre público y datos de contacto de tu local.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <InputLabel htmlFor="name" value="Nombre del Restaurante" className="text-xs font-bold" />
                            <TextInput
                                id="name"
                                type="text"
                                className="w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <InputLabel htmlFor="phone" value="Teléfono de Contacto" className="text-xs font-bold" />
                            <TextInput
                                id="phone"
                                type="text"
                                className="w-full"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <InputLabel htmlFor="address" value="Dirección Física" className="text-xs font-bold" />
                            <TextInput
                                id="address"
                                type="text"
                                className="w-full"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            <InputError message={errors.address} />
                        </div>
                    </div>
                </div>

                {/* Client Menu Customization Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <Palette className="w-5 h-5 text-orange-500" />
                        <div>
                            <h4 className="font-extrabold text-sm text-gray-950 dark:text-white">Personalización del Menú del Cliente</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Define los colores principales y copys que verá el cliente al escanear el QR.</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <InputLabel htmlFor="welcome_subtitle" value="Mensaje / Subtítulo de Bienvenida" className="text-xs font-bold" />
                            <TextInput
                                id="welcome_subtitle"
                                type="text"
                                className="w-full"
                                value={data.welcome_subtitle}
                                onChange={(e) => setData('welcome_subtitle', e.target.value)}
                                placeholder="Ej: ¡Pide desde tu mesa de forma rápida!"
                            />
                            <InputError message={errors.welcome_subtitle} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Primary Color Picker */}
                            <div className="space-y-2">
                                <InputLabel htmlFor="primary_color" value="Color Principal (Botones, Destacados)" className="text-xs font-bold" />
                                <div className="flex gap-2.5 items-center">
                                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                        <input
                                            type="color"
                                            id="primary_color"
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                        />
                                    </div>
                                    <TextInput
                                        type="text"
                                        value={data.primary_color}
                                        onChange={(e) => setData('primary_color', e.target.value)}
                                        className="w-full font-mono uppercase text-center"
                                        maxLength={7}
                                    />
                                </div>
                                <InputError message={errors.primary_color} />
                            </div>

                            {/* Secondary Color Picker */}
                            <div className="space-y-2">
                                <InputLabel htmlFor="secondary_color" value="Color de Fondo / Acento" className="text-xs font-bold" />
                                <div className="flex gap-2.5 items-center">
                                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                        <input
                                            type="color"
                                            id="secondary_color"
                                            value={data.secondary_color}
                                            onChange={(e) => setData('secondary_color', e.target.value)}
                                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                        />
                                    </div>
                                    <TextInput
                                        type="text"
                                        value={data.secondary_color}
                                        onChange={(e) => setData('secondary_color', e.target.value)}
                                        className="w-full font-mono uppercase text-center"
                                        maxLength={7}
                                    />
                                </div>
                                <InputError message={errors.secondary_color} />
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="p-5 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-950/20 space-y-3">
                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Vista Previa Dinámica de Botón</span>
                            <div className="flex justify-center py-4">
                                <button
                                    type="button"
                                    style={{ backgroundColor: data.primary_color, color: '#ffffff' }}
                                    className="px-6 py-3 font-extrabold rounded-2xl text-xs shadow-lg transition-transform hover:scale-102 active:scale-98"
                                >
                                    Enviar Autopedido 🍽️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions and Billings Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <ShieldAlert className="w-5 h-5 text-orange-500" />
                        <div>
                            <h4 className="font-extrabold text-sm text-gray-950 dark:text-white">Permisos de Personal y Cobros</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Define qué acciones tienen permitidas realizar tus meseros dentro del sistema.</p>
                        </div>
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-955/20 border border-gray-150 dark:border-gray-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                        <div className="space-y-1 flex-1">
                            <h5 className="text-xs font-black text-gray-850 dark:text-gray-250">
                                Permitir que los Meseros Cobren Cuentas
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                                Si está activado, tus meseros podrán presionar el botón "Cobrado" en sus paneles y en la hoja de pedidos para dar por pagada una mesa y liberarla. Si se desactiva, solo los administradores o dueños del restaurante podrán registrar cobros.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggleLocalState('waiters_can_collect_payment')}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all flex-shrink-0 cursor-pointer ${
                                data.waiters_can_collect_payment ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-850 justify-start'
                            }`}
                        >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                        </button>
                    </div>
                </div>

                {/* Customer Security Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <span className="text-xl">🛡️</span>
                        <div>
                            <h4 className="font-extrabold text-sm text-gray-950 dark:text-white">Seguridad y Prevención de Abuso de Clientes</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Evita que clientes fuera del local envíen solicitudes o abusen del botón de llamar al mesero.</p>
                        </div>
                    </div>

                    {/* client_can_call_waiter */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-955/20 border border-gray-150 dark:border-gray-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                        <div className="space-y-1 flex-1">
                            <h5 className="text-xs font-black text-gray-850 dark:text-gray-250">
                                Habilitar Botón "Llamar al Mesero"
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                                Muestra u oculta el botón "Llamar al Mesero" en el menú del cliente. Si se desactiva, los clientes no podrán enviar notificaciones de llamada directamente.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggleLocalState('client_can_call_waiter')}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all flex-shrink-0 cursor-pointer ${
                                data.client_can_call_waiter ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-850 justify-start'
                            }`}
                        >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                        </button>
                    </div>

                    {/* security_require_physical_scan */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                        <div className="space-y-1 flex-1">
                            <h5 className="text-xs font-black text-gray-855 dark:text-gray-250">
                                Requerir Escaneo QR Físico Continuo
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                                Fuerza a que el navegador del cliente escanee físicamente el código QR con la cámara de su celular cada 30 minutos. Esto evita de forma definitiva que se lleven el enlace o compartan la URL fuera del establecimiento para hacer bromas o abusos.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggleLocalState('security_require_physical_scan')}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all flex-shrink-0 cursor-pointer ${
                                data.security_require_physical_scan ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-800 justify-start'
                            }`}
                        >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                        </button>
                    </div>

                    {/* security_table_pin */}
                    <div className="p-5 bg-gray-50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                        <div className="space-y-1 flex-1">
                            <h5 className="text-xs font-black text-gray-855 dark:text-gray-250">
                                Requerir PIN de Seguridad para Pedir
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                                Si está activado, el cliente deberá ingresar un PIN de 4 dígitos generado en mesa para poder enviar pedidos o visualizar el consumo. Si se desactiva, el cliente podrá ver el menú y realizar pedidos directamente sin ingresar ningún código PIN.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleToggleLocalState('security_table_pin')}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all flex-shrink-0 cursor-pointer ${
                                data.security_table_pin ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-800 justify-start'
                            }`}
                        >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                        </button>
                    </div>
                </div>

                {/* Notifications Panel */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <Bell className="w-5 h-5 text-orange-500" />
                        <div>
                            <h4 className="font-extrabold text-sm text-gray-950 dark:text-white">Alertas en tiempo real</h4>
                            <p className="text-[11px] text-gray-400 font-semibold">Las solicitudes se actualizan automáticamente en segundo plano cada 5s.</p>
                        </div>
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-955/20 border border-gray-150 dark:border-gray-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-gray-300 dark:hover:border-gray-700">
                        <div className="space-y-1 flex-1">
                            <h5 className="text-xs font-black text-gray-850 dark:text-gray-250">
                                Sonido de Notificaciones
                            </h5>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                                Reproducir una alerta acústica en la consola cuando ingresa una nueva solicitud de pedido desde un código QR.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleAudio}
                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all flex-shrink-0 cursor-pointer ${
                                audioEnabled ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-850 justify-start'
                            }`}
                        >
                            <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                        </button>
                    </div>
                </div>

                {/* Floating Save Button on bottom-right */}
                <div className="fixed bottom-6 left-6 z-50 flex items-center">
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="!bg-gradient-to-tr !from-orange-500 !to-amber-600 hover:!from-orange-600 hover:!to-amber-600 !text-white hover:scale-105 active:scale-95 shadow-xl py-3 px-6 rounded-full font-black text-xs transition-all flex items-center gap-1.5 border border-orange-400/20"
                    >
                        <Check className="w-4 h-4" />
                        Guardar Cambios
                    </PrimaryButton>
                </div>
            </form>
        </AdminLayout>
    );
}
