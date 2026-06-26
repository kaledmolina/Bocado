import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    Search, 
    Plus, 
    X, 
    Trash2, 
    Edit, 
    Eye, 
    ChevronLeft, 
    ChevronRight,
    Users,
    Mail,
    Calendar,
    User,
    Copy,
    Check,
    Star,
    Briefcase,
    Phone,
    MapPin,
    Cake,
    Award,
    FileText
} from 'lucide-react';

interface Waiter {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    shifts: Array<{ id: number; started_at: string }>;
    experience_hours: number;
    average_rating: number;
    phone?: string | null;
    city?: string | null;
    birthday?: string | null;
    bio?: string | null;
    skills?: string | null;
    experience_description?: string | null;
    ratings?: Rating[];
}

interface Rating {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    restaurant: {
        id: number;
        name: string;
    };
}

interface AvailableWaiter {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    birthday?: string | null;
    bio?: string | null;
    skills?: string | null;
    experience_description?: string | null;
    created_at: string;
    experience_hours: number;
    average_rating: number;
    ratings: Rating[];
    applications?: Array<{
        id: number;
        status: string;
    }>;
}

interface Props {
    waiters: Waiter[];
    applications: Array<{
        id: number;
        user: {
            id: number;
            name: string;
            email: string;
            experience_hours: number;
            average_rating: number;
            phone?: string | null;
            city?: string | null;
            birthday?: string | null;
            bio?: string | null;
            skills?: string | null;
            experience_description?: string | null;
            ratings?: Rating[];
        };
        status: string;
    }>;
    availableWaiters?: AvailableWaiter[];
    restaurant: {
        id: number;
        is_hiring: boolean;
    };
    invitationLink: string;
}

const ITEMS_PER_PAGE = 6;

export default function Waiters({ waiters, invitationLink, applications = [], availableWaiters = [], restaurant }: Props) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
    const [viewingWaiter, setViewingWaiter] = useState<Waiter | null>(null);
    const [mounted, setMounted] = useState(false);
    const [copiedInvite, setCopiedInvite] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const copyInviteLink = () => {
        navigator.clipboard.writeText(invitationLink);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2050);
    };

    const toggleStatus = (id: number) => {
        router.post(route('admin.waiters.toggle-status', id), {}, {
            preserveScroll: true
        });
    };

    const [activeTab, setActiveTab] = useState<'list' | 'applications' | 'talents'>('list');

    const [viewingReviews, setViewingReviews] = useState<{
        isOpen: boolean;
        waiterName: string;
        ratings: Rating[];
    }>({
        isOpen: false,
        waiterName: '',
        ratings: [],
    });

    const [ratingModal, setRatingModal] = useState<{
        isOpen: boolean;
        waiterId: number | null;
        waiterName: string;
        rating: number;
        comment: string;
    }>({
        isOpen: false,
        waiterId: null,
        waiterName: '',
        rating: 5,
        comment: '',
    });

    const handleToggleHiring = () => {
        router.post(route('admin.toggle-hiring'), {}, {
            preserveScroll: true
        });
    };

    const handleProcessApplication = (applicationId: number, status: 'approved' | 'rejected') => {
        router.post(route('admin.applications.process', applicationId), { status }, {
            preserveScroll: true
        });
    };

    const handleForceEndShift = (shiftId: number) => {
        router.post(route('waiter.shifts.end'), { shift_id: shiftId }, {
            preserveScroll: true
        });
    };

    const handleHireWaiter = (waiterId: number) => {
        router.post(route('admin.waiters.hire', waiterId), {}, {
            preserveScroll: true
        });
    };

    const handleOpenRatingModal = (waiter: Waiter) => {
        setRatingModal({
            isOpen: true,
            waiterId: waiter.id,
            waiterName: waiter.name,
            rating: 5,
            comment: '',
        });
    };

    const submitRating = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ratingModal.waiterId) return;

        router.post(route('admin.waiters.rate', ratingModal.waiterId), {
            rating: ratingModal.rating,
            comment: ratingModal.comment,
        }, {
            onSuccess: () => {
                setRatingModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
        isDanger?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const openCreateModal = () => {
        setEditingWaiter(null);
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (waiter: Waiter) => {
        setEditingWaiter(waiter);
        clearErrors();
        setData({
            name: waiter.name,
            email: waiter.email,
            password: '', // Leave empty to keep old password
        });
        setIsModalOpen(true);
    };

    const openViewModal = (waiter: Waiter) => {
        setViewingWaiter(waiter);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingWaiter(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingWaiter) {
            put(route('admin.waiters.update', editingWaiter.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.waiters.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Mesero',
            message: '¿Estás seguro de que deseas eliminar este mesero? Su cuenta será revocada de inmediato.',
            confirmLabel: 'Eliminar',
            onConfirm: () => {
                destroy(route('admin.waiters.destroy', id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    // Filter logic
    const filteredWaiters = waiters.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredWaiters.length / ITEMS_PER_PAGE);
    const paginatedWaiters = filteredWaiters.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page on search
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <AdminLayout title="Gestión de Meseros">
            <Head title="Meseros" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona las cuentas de tu personal de mesa, monitorea sus turnos y procesa las nuevas postulaciones.
                    </p>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-450 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar mesero..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-sm rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-800 dark:text-gray-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Invitation Link Section */}
                <div className="bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-orange-500/5 border border-orange-500/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-250">Enlace de Invitación de Meseros</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Comparte este enlace para que tu personal llene sus propios datos y active su cuenta de mesero.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <p className="text-xs text-gray-750 dark:text-gray-300 font-mono bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-150 dark:border-gray-850 flex-1 md:w-80 truncate select-all">
                            {invitationLink}
                        </p>
                        <button
                            onClick={copyInviteLink}
                            className="p-3 rounded-2xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm flex-shrink-0"
                            title="Copiar Enlace de Invitación"
                        >
                            {copiedInvite ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 mt-2">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`pb-3 text-sm font-black transition-all border-b-2 ${
                            activeTab === 'list'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        Meseros Activos ({waiters.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`pb-3 text-sm font-black transition-all border-b-2 ${
                            activeTab === 'applications'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        Solicitudes de Vinculación ({applications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('talents')}
                        className={`pb-3 text-sm font-black transition-all border-b-2 ${
                            activeTab === 'talents'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        Bolsa de Talentos ({availableWaiters.length})
                    </button>
                </div>

                {/* Waiters List Tab */}
                {activeTab === 'list' && (
                    <>
                        {paginatedWaiters.length === 0 ? (
                            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center">
                                <Users className="w-12 h-12 text-orange-500/20 mb-3 animate-pulse" />
                                <h4 className="font-bold text-gray-700 dark:text-gray-300">No se encontraron meseros</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    {searchQuery ? 'Prueba con otra búsqueda.' : 'Crea una cuenta para tu primer mesero aquí.'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Mesero</th>
                                                <th className="px-6 py-4">Correo Electrónico</th>
                                                <th className="px-6 py-4">Experiencia/Calificación</th>
                                                <th className="px-6 py-4">Turno Actual</th>
                                                <th className="px-6 py-4">Estado</th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                            {paginatedWaiters.map((waiter) => (
                                                <tr key={waiter.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-all">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center">
                                                            {waiter.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{waiter.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{waiter.email}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-semibold text-gray-850 dark:text-gray-250">
                                                            {waiter.experience_hours}h exp
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-0.5">
                                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                            {waiter.average_rating > 0 ? waiter.average_rating : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {waiter.shifts && waiter.shifts.length > 0 ? (
                                                            <div className="space-y-1">
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                                                    En Turno
                                                                </span>
                                                                <span className="block text-[10px] text-gray-400">
                                                                    Inició: {new Date(waiter.shifts[0].started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleForceEndShift(waiter.shifts[0].id)}
                                                                    className="text-[10px] text-orange-500 hover:text-orange-600 underline font-bold block"
                                                                >
                                                                    Cerrar Turno
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Fuera de Turno</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {waiter.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 shadow-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                Activo
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => toggleStatus(waiter.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                                                                title="Aprobar Mesero"
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                                Aprobar
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => openViewModal(waiter)}
                                                                className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="space-y-6">
                        {/* Toggle is_hiring setting */}
                        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-250">Bolsa de Empleo: Buscando Meseros</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Si está activado, los meseros registrados sin local podrán ver tu restaurante en la bolsa de trabajo y postularse.
                                </p>
                            </div>
                            <button
                                onClick={handleToggleHiring}
                                className={`w-12 h-7 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer border border-transparent ${
                                    restaurant.is_hiring ? 'bg-orange-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                                }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                            </button>
                        </div>

                        {/* Applications Grid */}
                        {applications.length === 0 ? (
                            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center shadow-sm">
                                <span className="text-3xl mb-3">✉️</span>
                                <h4 className="font-bold text-gray-700 dark:text-gray-300">No hay postulaciones pendientes</h4>
                                <p className="text-xs text-gray-500 mt-1">Cuando los meseros se postulen, aparecerán aquí.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {applications.map((app) => (
                                    <div key={app.id} className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col justify-between shadow-sm">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-lg shadow-inner">
                                                    {app.user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base text-gray-950 dark:text-white leading-tight">{app.user.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{app.user.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150 dark:border-gray-850">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Experiencia</span>
                                                    <span className="text-sm font-black text-gray-850 dark:text-gray-250">{app.user.experience_hours} horas</span>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150 dark:border-gray-800">
                                                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Calificación</span>
                                                    <span className="text-sm font-black text-gray-850 dark:text-gray-255 flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                        {app.user.average_rating > 0 ? `${app.user.average_rating} / 5` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2.5 mt-5">
                                            <button
                                                onClick={() => {
                                                    setViewingWaiter(app.user as any);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="flex-1 py-2 rounded-xl border border-gray-205 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-750 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                                            >
                                                Ver Perfil
                                            </button>
                                            <button
                                                onClick={() => handleProcessApplication(app.id, 'rejected')}
                                                className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-750 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                                            >
                                                Rechazar
                                            </button>
                                            <button
                                                onClick={() => handleProcessApplication(app.id, 'approved')}
                                                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                            >
                                                Aceptar Mesero
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Bolsa de Talentos Tab */}
                {activeTab === 'talents' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-orange-500/5 border border-orange-500/10 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-250">Bolsa de Talentos del Sistema</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Aquí puedes ver a todos los meseros disponibles que no pertenecen a ningún restaurante, evaluar sus calificaciones históricas y contratarlos al instante.
                                </p>
                            </div>
                        </div>

                        {/* Available Waiters Grid */}
                        {availableWaiters.filter(w => 
                            w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            w.email.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 ? (
                            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center shadow-sm">
                                <Briefcase className="w-12 h-12 text-orange-500/20 mb-3 animate-pulse" />
                                <h4 className="font-bold text-gray-700 dark:text-gray-300">No hay meseros disponibles</h4>
                                <p className="text-xs text-gray-500 mt-1">Cuando haya meseros buscando empleo, aparecerán en esta lista.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableWaiters.filter(w => 
                                    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    w.email.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((waiter) => {
                                    const appRecord = waiter.applications?.[0];
                                    const isInvited = appRecord?.status === 'invited';
                                    const hasApplied = appRecord?.status === 'pending';

                                    return (
                                        <div key={waiter.id} className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col justify-between shadow-sm">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-lg shadow-inner">
                                                        {waiter.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-base text-gray-950 dark:text-white leading-tight">{waiter.name}</h4>
                                                        <div className="flex flex-col gap-0.5 mt-1.5">
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                                <Mail className="w-3.5 h-3.5 text-gray-450" />
                                                                {waiter.email}
                                                            </span>
                                                            {waiter.phone ? (
                                                                <span className="text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-semibold">
                                                                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                                                                    {waiter.phone}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] text-gray-400 dark:text-gray-500 italic flex items-center gap-1.5">
                                                                    <Phone className="w-3.5 h-3.5 text-gray-300 dark:text-gray-750" />
                                                                    Sin teléfono
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                    <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150 dark:border-gray-800">
                                                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Experiencia</span>
                                                        <span className="text-sm font-black text-gray-850 dark:text-gray-250">{waiter.experience_hours} horas</span>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150 dark:border-gray-800">
                                                        <span className="text-[9px] text-gray-400 uppercase font-bold block">Calificación</span>
                                                        <span className="text-sm font-black text-gray-850 dark:text-gray-255 flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                            {waiter.average_rating > 0 ? `${waiter.average_rating} / 5` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 mt-5">
                                                <button
                                                    onClick={() => {
                                                        setViewingWaiter(waiter as any);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="flex-1 py-2 rounded-xl border border-gray-250 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all cursor-pointer"
                                                >
                                                    Ver Perfil
                                                </button>
                                                {isInvited ? (
                                                    <button
                                                        disabled
                                                        className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-xs font-bold cursor-not-allowed"
                                                    >
                                                        Propuesta Enviada
                                                    </button>
                                                ) : hasApplied ? (
                                                    <button
                                                        onClick={() => handleHireWaiter(waiter.id)}
                                                        className="flex-1 py-2 bg-green-650 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer animate-pulse"
                                                    >
                                                        Aceptar Solicitud
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleHireWaiter(waiter.id)}
                                                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                                                    >
                                                        Contratar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-800 pt-6 mt-4">
                        <p className="text-xs text-gray-500">
                            Mostrando <span className="font-semibold">{paginatedWaiters.length}</span> de <span className="font-semibold">{filteredWaiters.length}</span> meseros
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold px-3 text-gray-700 dark:text-gray-300">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Waiter Modal */}
            {isViewModalOpen && viewingWaiter && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <User className="w-5 h-5 text-orange-500" />
                                Perfil Detallado de Mesero
                            </h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {/* Left Column: Avatar & Personal Data */}
                            <div className="space-y-4">
                                <div className="flex flex-col items-center py-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150/40 dark:border-gray-800/45">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-lg mb-2">
                                        {viewingWaiter.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">{viewingWaiter.name}</h4>
                                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mt-1">Personal de mesa</span>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                        <Mail className="w-4 h-4 text-orange-500" />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Correo Electrónico</span>
                                            <span className="text-gray-800 dark:text-gray-250 font-semibold block truncate">{viewingWaiter.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                        <Phone className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Número de Teléfono</span>
                                            <span className="text-gray-800 dark:text-gray-250 font-semibold block">
                                                {viewingWaiter.phone || <span className="text-gray-400 dark:text-gray-600 italic font-normal">No especificado</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Ciudad / Residencia</span>
                                            <span className="text-gray-800 dark:text-gray-250 font-semibold block">
                                                {viewingWaiter.city || <span className="text-gray-400 dark:text-gray-600 italic font-normal">No especificado</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850">
                                        <Cake className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wider">Cumpleaños / Edad</span>
                                            <span className="text-gray-800 dark:text-gray-250 font-semibold block">
                                                {viewingWaiter.birthday ? (
                                                    `${new Date(viewingWaiter.birthday).toLocaleDateString()} (${(() => {
                                                        const today = new Date();
                                                        const birthDate = new Date(viewingWaiter.birthday);
                                                        let ageVal = today.getFullYear() - birthDate.getFullYear();
                                                        const m = today.getMonth() - birthDate.getMonth();
                                                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                            ageVal--;
                                                        }
                                                        return ageVal;
                                                    })()} años)`
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600 italic font-normal">No especificado</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Bio, Skills & Experience */}
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-[10px] text-gray-450 dark:text-gray-400 font-black uppercase tracking-wider mb-1">Habilidades</h5>
                                    {viewingWaiter.skills ? (
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {viewingWaiter.skills.split(',').map((skill, index) => (
                                                <span key={index} className="px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-wide border border-orange-500/10">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-600 italic">Sin habilidades especificadas.</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <h5 className="text-[10px] text-gray-400 dark:text-gray-400 font-black uppercase tracking-wider mb-1">Sobre mí (Presentación)</h5>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150/40 dark:border-gray-850/50">
                                        {viewingWaiter.bio || <span className="text-gray-400 dark:text-gray-600 italic">El mesero no ha redactado una presentación todavía.</span>}
                                    </p>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <h5 className="text-[10px] text-gray-400 dark:text-gray-400 font-black uppercase tracking-wider mb-1">Experiencia Laboral Externa</h5>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-150/40 dark:border-gray-850/50">
                                        {viewingWaiter.experience_description || <span className="text-gray-400 dark:text-gray-600 italic">Sin historial de experiencia externa cargado.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 gap-3 bg-orange-500/5 dark:bg-orange-500/10 p-3.5 rounded-3xl border border-orange-500/15">
                            <div className="text-center border-r border-orange-500/10">
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black block tracking-wider">Horas en la plataforma</span>
                                <span className="text-base font-black text-orange-600 dark:text-orange-400">{viewingWaiter.experience_hours} horas</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-black block tracking-wider">Calificación Promedio</span>
                                <span className="text-base font-black text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    {viewingWaiter.average_rating > 0 ? `${viewingWaiter.average_rating} / 5` : 'Sin reseñas'}
                                </span>
                            </div>
                        </div>

                        {/* Reviews History */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-850 dark:text-gray-350">Historial de Reseñas</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                {!viewingWaiter.ratings || viewingWaiter.ratings.length === 0 ? (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-4">Este mesero no tiene reseñas ni calificaciones de restaurantes todavía.</p>
                                ) : (
                                    viewingWaiter.ratings.map((review) => (
                                        <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-800 space-y-1.5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-extrabold text-xs text-gray-800 dark:text-gray-200">{review.restaurant?.name || 'Restaurante Anterior'}</h5>
                                                    <span className="text-[9px] text-gray-450 block">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    {review.rating}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-xs text-gray-605 dark:text-gray-400 italic bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-100 dark:border-gray-900 leading-normal">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                            >
                                Cerrar Perfil
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Add / Edit Waiter Modal */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold">
                                {editingWaiter ? 'Editar Cuenta' : 'Registrar Mesero'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    {editingWaiter ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required={!editingWaiter}
                                />
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-semibold text-gray-850 dark:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                                >
                                    {editingWaiter ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {/* Rating & Dismissal Modal */}
            {ratingModal.isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Finalizar Contrato
                            </h3>
                            <button 
                                onClick={() => setRatingModal(prev => ({ ...prev, isOpen: false }))} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitRating} className="space-y-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Vas a desvincular a <span className="font-extrabold text-gray-800 dark:text-gray-200">{ratingModal.waiterName}</span> de tu restaurante. Califícalo para guardar su historial de experiencia laboral.
                            </p>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-450 mb-1.5 uppercase tracking-wider">
                                    Calificación (1 - 5 Estrellas)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRatingModal(prev => ({ ...prev, rating: star }))}
                                            className="p-1 focus:outline-none transition-transform active:scale-95"
                                        >
                                            <Star 
                                                className={`w-8 h-8 transition-colors ${
                                                    star <= ratingModal.rating 
                                                        ? 'fill-amber-500 text-amber-500' 
                                                        : 'text-gray-300 dark:text-gray-700'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                                    Comentario / Reseña
                                </label>
                                <textarea
                                    value={ratingModal.comment}
                                    onChange={e => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Ej. Excelente mesero, puntual y muy amable con los clientes..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-sm h-24 resize-none"
                                    maxLength={500}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-semibold text-gray-850 dark:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md"
                                >
                                    Finalizar y Calificar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Viewing Reviews Modal */}
            {viewingReviews.isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                                Historial de {viewingReviews.waiterName}
                            </h3>
                            <button 
                                onClick={() => setViewingReviews(prev => ({ ...prev, isOpen: false }))} 
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                            {viewingReviews.ratings.length === 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6 italic">
                                    Este mesero no tiene reseñas ni calificaciones registradas todavía.
                                </p>
                            ) : (
                                viewingReviews.ratings.map((r) => (
                                    <div key={r.id} className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-2.5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-extrabold text-sm text-gray-850 dark:text-gray-200">
                                                    {r.restaurant?.name || 'Restaurante Ex'}
                                                </h4>
                                                <span className="text-[10px] text-gray-450 block">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                {r.rating}
                                            </div>
                                        </div>
                                        {r.comment && (
                                            <p className="text-xs text-gray-600 dark:text-gray-350 italic bg-white dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-900 leading-relaxed">
                                                "{r.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setViewingReviews(prev => ({ ...prev, isOpen: false }))}
                                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                isDanger={confirmModal.isDanger}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </AdminLayout>
    );
}
