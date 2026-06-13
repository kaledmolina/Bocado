import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
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
    Printer, 
    ChevronLeft, 
    ChevronRight,
    HelpCircle,
    Copy,
    Check
} from 'lucide-react';

interface Table {
    id: number;
    number: string;
    qr_code_token: string;
    status: 'free' | 'occupied' | 'payment_pending';
}

interface Props {
    tables: Table[];
}

const ITEMS_PER_PAGE = 8;

export default function Tables({ tables }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [viewingTable, setViewingTable] = useState<Table | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        number: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (table: Table) => {
        clearErrors();
        setEditingTable(table);
        setData({
            number: table.number,
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (table: Table) => {
        setViewingTable(table);
        setIsViewModalOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tables.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTable) {
            put(route('admin.tables.update', editingTable.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingTable(null);
                    reset();
                }
            } as any);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Mesa',
            message: '¿Estás seguro de que deseas eliminar esta mesa? Se perderán todos sus códigos QR activos.',
            confirmLabel: 'Eliminar',
            onConfirm: () => {
                destroy(route('admin.tables.destroy', id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    const openQrModal = (table: Table) => {
        setSelectedTable(table);
        setIsQrModalOpen(true);
    };

    const closeQrModal = () => {
        setIsQrModalOpen(false);
        setSelectedTable(null);
    };

    // Helper to get QR source
    const getQrImageSrc = (token: string) => {
        const url = window.location.origin + '/tables/' + token;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    };

    const getTableUrl = (token: string) => {
        return window.location.origin + '/tables/' + token;
    };

    const copyToClipboard = (token: string) => {
        navigator.clipboard.writeText(getTableUrl(token));
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    // Filters logic
    const filteredTables = tables.filter(t => {
        const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
        const matchesSearch = t.number.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredTables.length / ITEMS_PER_PAGE);
    const paginatedTables = filteredTables.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 on filter/search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchQuery]);

    return (
        <AdminLayout title="Gestión de Mesas">
            <Head title="Mesas & QRs" />

            <div className="flex flex-col gap-6">
                {/* Filters and Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedStatus('All')}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                selectedStatus === 'All'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setSelectedStatus('free')}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                selectedStatus === 'free'
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            Libres
                        </button>
                        <button
                            onClick={() => setSelectedStatus('occupied')}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                selectedStatus === 'occupied'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            Ocupadas
                        </button>
                        <button
                            onClick={() => setSelectedStatus('payment_pending')}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                selectedStatus === 'payment_pending'
                                    ? 'bg-rose-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            Por Cobrar
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-450 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar mesa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-sm rounded-2xl focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-800 dark:text-gray-100"
                            />
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-sm transition-all text-sm flex items-center gap-1.5 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Mesa
                        </button>
                    </div>
                </div>

                {/* Tables Grid */}
                {paginatedTables.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center">
                        <HelpCircle className="w-12 h-12 text-orange-500/20 mb-3 animate-bounce" />
                        <h4 className="font-bold text-gray-700 dark:text-gray-300">No se encontraron mesas</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchQuery || selectedStatus !== 'All' ? 'Prueba con otros filtros.' : 'Comienza agregando una nueva mesa para tu local.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedTables.map((table) => (
                            <div
                                key={table.id}
                                className="p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{table.number}</h4>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                            table.status === 'free'
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : table.status === 'occupied'
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {table.status === 'free' ? 'Libre' : table.status === 'occupied' ? 'Ocupada' : 'Por Cobrar'}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 flex items-center justify-center border border-gray-100 dark:border-gray-850 select-none relative group cursor-pointer" onClick={() => openQrModal(table)}>
                                        <img
                                            src={getQrImageSrc(table.qr_code_token)}
                                            alt={`QR Code ${table.number}`}
                                            className="w-28 h-28 object-contain transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1">
                                            <Eye className="w-4 h-4" />
                                            Ampliar QR
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                                    <button
                                        onClick={() => openViewModal(table)}
                                        className="flex-1 py-2 px-2 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                                        title="Ver Detalles"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => openEditModal(table)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                                        title="Editar Mesa"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(table.id)}
                                        className="p-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                        title="Eliminar Mesa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-800 pt-6 mt-4">
                        <p className="text-xs text-gray-500">
                            Mostrando <span className="font-semibold">{paginatedTables.length}</span> de <span className="font-semibold">{filteredTables.length}</span> mesas
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

            {/* Create Table Modal */}
            {isCreateModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold">Agregar Nueva Mesa</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Identificador / Número</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Mesa 1, Barra 2"
                                    value={data.number}
                                    onChange={e => setData('number', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required
                                    autoFocus
                                />
                                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-semibold text-gray-850 dark:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                                >
                                    Crear Mesa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Table Modal */}
            {isEditModalOpen && editingTable && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold">Editar Mesa</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Identificador / Número</label>
                                <input
                                    type="text"
                                    value={data.number}
                                    onChange={e => setData('number', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required
                                    autoFocus
                                />
                                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-semibold text-gray-850 dark:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* View Table Details Modal */}
            {isViewModalOpen && viewingTable && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Eye className="w-5 h-5 text-orange-500" />
                                Detalle de Mesa
                            </h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Nombre/Número</span>
                                <span className="font-bold text-gray-900 dark:text-white text-base">{viewingTable.number}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Estado de Ocupación</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    viewingTable.status === 'free' 
                                        ? 'bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400' 
                                        : viewingTable.status === 'occupied' 
                                        ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                        : 'bg-rose-100 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450'
                                }`}>
                                    {viewingTable.status === 'free' ? 'Libre' : viewingTable.status === 'occupied' ? 'Ocupada' : 'Por Cobrar'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Token del QR</span>
                                <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-lg">
                                    {viewingTable.qr_code_token}
                                </span>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 font-medium block mb-1">Enlace del Menú QR:</span>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-750 dark:text-gray-300 break-all p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 flex-1 truncate select-all">
                                        {getTableUrl(viewingTable.qr_code_token)}
                                    </p>
                                    <button 
                                        onClick={() => copyToClipboard(viewingTable.qr_code_token)}
                                        className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {copiedToken === viewingTable.qr_code_token ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* QR Zoom Modal */}
            {isQrModalOpen && selectedTable && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
                        <div className="w-full flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold">{selectedTable.number}</h3>
                            <button onClick={closeQrModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                            <img
                                src={getQrImageSrc(selectedTable.qr_code_token)}
                                alt={`QR Code ${selectedTable.number}`}
                                className="w-64 h-64 mx-auto"
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-450 break-all select-all p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                {getTableUrl(selectedTable.qr_code_token)}
                            </p>
                            <span className="text-xs text-gray-450 block">
                                Pega este código QR en la mesa. Al escanearlo, los clientes verán el menú y los meseros tomarán el pedido.
                            </span>
                        </div>

                        <div className="w-full flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={closeQrModal}
                                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir
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
