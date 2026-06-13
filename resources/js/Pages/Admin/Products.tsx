import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    Plus, 
    X, 
    Check, 
    ShoppingBag, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    category: string;
    is_available: boolean;
    image_path?: string | null;
}

interface Props {
    products: Product[];
}

const DEFAULT_CATEGORIES = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres'];
const ITEMS_PER_PAGE = 9;

export default function Products({ products }: Props) {
    const customCategories = Array.from(new Set(products.map(p => p.category)))
        .filter(cat => !DEFAULT_CATEGORIES.includes(cat));
    const CATEGORIES = [...DEFAULT_CATEGORIES, ...customCategories];

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
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

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: '',
        category: 'Platos Fuertes',
        is_available: true,
        image: null as File | null,
        image_url: '',
    });

    React.useEffect(() => {
        if (data.image) {
            const objectUrl = URL.createObjectURL(data.image);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(data.image_url || null);
        }
    }, [data.image, data.image_url]);

    const openCreateModal = () => {
        setEditingProduct(null);
        clearErrors();
        setIsCreatingCustom(false);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        clearErrors();
        setIsCreatingCustom(false);
        setData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            category: product.category,
            is_available: product.is_available,
            image: null,
            image_url: product.image_path || '',
        });
        setIsModalOpen(true);
    };

    const openViewModal = (product: Product) => {
        setViewingProduct(product);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewingProduct(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare request payload for file upload
        const payload = {
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            is_available: data.is_available,
            image: data.image,
            image_url: data.image_url,
        };

        if (editingProduct) {
            router.post(route('admin.products.update', editingProduct.id), {
                ...payload,
                _method: 'PUT',
            } as any, {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.products.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producto',
            message: '¿Estás seguro de que deseas eliminar este producto?',
            confirmLabel: 'Eliminar',
            onConfirm: () => {
                destroy(route('admin.products.destroy', id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
        });
    };

    const toggleAvailability = (product: Product) => {
        router.post(route('admin.products.update', product.id), {
            _method: 'PUT',
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            category: product.category,
            is_available: !product.is_available,
            image_url: product.image_path || '',
        } as any);
    };

    // Filter logic
    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 on filter/search change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    return (
        <AdminLayout title="Platillos y Productos">
            <Head title="Productos" />

            <div className="flex flex-col gap-6">
                {/* Search and Category Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                selectedCategory === 'All'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            Todos
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-gray-450 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar plato..."
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
                            Agregar
                        </button>
                    </div>
                </div>                {/* Products Grid */}
                {paginatedProducts.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl flex flex-col items-center">
                        <ShoppingBag className="w-12 h-12 text-orange-500/20 mb-3 animate-pulse" />
                        <h4 className="font-bold text-gray-700 dark:text-gray-300">No hay productos</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchQuery ? 'Prueba con otra búsqueda o filtro.' : 'Presiona "Agregar" para crear tu primer producto.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedProducts.map((product) => {
                            return (
                                <div
                                    key={product.id}
                                    className={`bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md overflow-hidden ${
                                        !product.is_available ? 'opacity-65' : ''
                                    }`}
                                >
                                    {product.image_path ? (
                                        <div className="h-40 w-full overflow-hidden relative border-b border-gray-100 dark:border-gray-850">
                                            <img 
                                                src={product.image_path} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-28 w-full bg-gradient-to-br from-orange-500/5 to-amber-500/5 flex items-center justify-center border-b border-gray-100 dark:border-gray-850">
                                            <span className="text-3xl">🍲</span>
                                        </div>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-full border border-orange-100 dark:border-orange-900/20">
                                                        {product.category}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2.5 truncate max-w-[180px]">{product.name}</h4>
                                                </div>
                                                <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
                                                    ${Number(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                                                {product.description || 'Sin descripción disponible.'}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                            {/* Toggle Availability */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleAvailability(product)}
                                                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                                                        product.is_available ? 'bg-green-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                                                    }`}
                                                >
                                                    <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
                                                </button>
                                                <span className="text-xs font-semibold text-gray-500">
                                                    {product.is_available ? 'Disponible' : 'Agotado'}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => openViewModal(product)}
                                                    className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all"
                                                    title="Ver Detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-150 dark:border-gray-800 pt-6 mt-4">
                        <p className="text-xs text-gray-500">
                            Mostrando <span className="font-semibold">{paginatedProducts.length}</span> de <span className="font-semibold">{filteredProducts.length}</span> productos
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

            {/* View Details Modal */}
            {isViewModalOpen && viewingProduct && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Detalle de Producto
                            </h3>
                            <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {viewingProduct.image_path && (
                            <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-800">
                                <img
                                    src={viewingProduct.image_path}
                                    alt={viewingProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Categoría</span>
                                <span className="font-semibold px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-full text-xs">
                                    {viewingProduct.category}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Nombre</span>
                                <span className="font-bold text-gray-900 dark:text-white text-base">{viewingProduct.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Precio</span>
                                <span className="font-extrabold text-orange-600 dark:text-orange-400 text-lg">${Number(viewingProduct.price).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Estado</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    viewingProduct.is_available 
                                        ? 'bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400' 
                                        : 'bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400'
                                }`}>
                                    {viewingProduct.is_available ? 'Disponible' : 'Agotado'}
                                </span>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 font-medium block mb-1">Descripción:</span>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-3 rounded-2xl border border-gray-100 dark:border-gray-850 italic">
                                    {viewingProduct.description || 'Sin descripción detallada.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={closeViewModal}
                                 className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold">
                                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Imagen del Producto</label>
                                <div className="flex items-center gap-4 mb-2">
                                    {imagePreview && (
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-950/20 dark:file:text-orange-400 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="O ingresa la URL de una imagen externa (ej: https://...)"
                                    value={data.image_url}
                                    onChange={e => setData('image_url', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs"
                                />
                                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                                {errors.image_url && <p className="text-xs text-red-500 mt-1">{errors.image_url}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Precio ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800"
                                        required
                                    />
                                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Categoría</label>
                                    <select
                                        value={isCreatingCustom ? '__new__' : data.category}
                                        onChange={e => {
                                            if (e.target.value === '__new__') {
                                                setIsCreatingCustom(true);
                                                setData('category', '');
                                            } else {
                                                setIsCreatingCustom(false);
                                                setData('category', e.target.value);
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-1 focus:ring-orange-550 focus:border-orange-550 focus:outline-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__new__">+ Nueva categoría...</option>
                                    </select>
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </div>
                            </div>

                            {isCreatingCustom && (
                                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">Nombre de la Nueva Categoría</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreatingCustom(false);
                                                setData('category', CATEGORIES[0] || 'Entradas');
                                            }}
                                            className="text-[10px] text-orange-500 font-black hover:underline"
                                        >
                                            Seleccionar existente
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ej: Ensaladas, Cocteles..."
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none dark:text-white text-gray-800 text-xs font-semibold"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Descripción</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full h-24 px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-transparent focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none resize-none dark:text-white text-gray-800"
                                />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_available"
                                    checked={data.is_available}
                                    onChange={e => setData('is_available', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-305 text-orange-600 focus:ring-orange-550"
                                />
                                <label htmlFor="is_available" className="text-sm font-semibold text-gray-600 dark:text-gray-300 select-none">
                                    Disponible para la venta inmediatamente
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-semibold text-gray-800 dark:text-gray-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                                >
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
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
