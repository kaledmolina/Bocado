import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    Building2, 
    Users, 
    Utensils, 
    Smartphone, 
    Search, 
    Power, 
    PowerOff, 
    ShieldAlert, 
    ShieldCheck, 
    LogOut,
    UserCheck,
    Store,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    TrendingUp,
    PieChart as PieIcon,
    Calendar,
    Mail,
    Phone,
    MapPin,
    ArrowUpDown,
    DollarSign,
    Sun,
    Moon
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    CartesianGrid, 
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface RestaurantStat {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    products_count: number;
    tables_count: number;
    waiters_count: number;
    is_active: boolean;
    is_demo: boolean;
    total_sales?: string | number | null;
    sales_count?: number;
    created_at: string;
}

interface UserStat {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'waiter';
    is_active: boolean;
    restaurant?: {
        name: string;
    } | null;
    created_at: string;
}

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        }
    };
    restaurants: RestaurantStat[];
    users: UserStat[];
    totalUsers: number;
    totalProducts: number;
    totalTables: number;
}

const ITEMS_PER_PAGE = 5;
const CHART_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308'];

export default function Dashboard({ auth, restaurants, users, totalUsers, totalProducts, totalTables }: Props) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
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

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [activeTab, setActiveTab] = useState<'restaurants' | 'users'>('restaurants');
    
    // Search, Status, and Sort for Restaurants
    const [restaurantSearch, setRestaurantSearch] = useState('');
    const [restaurantStatusFilter, setRestaurantStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
    const [sortBy, setSortBy] = useState<'name' | 'sales'>('sales');
    const [restaurantPage, setRestaurantPage] = useState(1);

    // Search, Status, and Role Filters for Users
    const [userSearch, setUserSearch] = useState('');
    const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
    const [userRoleFilter, setUserRoleFilter] = useState<'All' | 'admin' | 'waiter'>('All');
    const [userPage, setUserPage] = useState(1);

    // Modales detail viewing state
    const [viewingRestaurant, setViewingRestaurant] = useState<RestaurantStat | null>(null);
    const [viewingUser, setViewingUser] = useState<UserStat | null>(null);

    const toggleRestaurant = (id: number, name: string, active: boolean) => {
        const action = active ? 'desactivar' : 'activar';
        setConfirmModal({
            isOpen: true,
            title: active ? 'Desactivar Restaurante' : 'Activar Restaurante',
            message: `¿Estás seguro de que deseas ${action} el restaurante "${name}"?`,
            confirmLabel: active ? 'Desactivar' : 'Activar',
            onConfirm: () => {
                router.post(route('superadmin.restaurants.toggle', id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: active,
        });
    };

    const toggleUser = (id: number, name: string, active: boolean) => {
        const action = active ? 'desactivar' : 'activar';
        setConfirmModal({
            isOpen: true,
            title: active ? 'Desactivar Usuario' : 'Activar Usuario',
            message: `¿Estás seguro de que deseas ${action} al usuario "${name}"?`,
            confirmLabel: active ? 'Desactivar' : 'Activar',
            onConfirm: () => {
                router.post(route('superadmin.users.toggle', id));
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: active,
        });
    };

    // Filter Restaurants logic
    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
            (r.address && r.address.toLowerCase().includes(restaurantSearch.toLowerCase()));
        
        const matchesStatus = restaurantStatusFilter === 'All' || 
            (restaurantStatusFilter === 'active' && r.is_active) ||
            (restaurantStatusFilter === 'inactive' && !r.is_active);

        return matchesSearch && matchesStatus;
    });

    // Sort Restaurants logic
    const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
        if (sortBy === 'sales') {
            return Number(b.total_sales || 0) - Number(a.total_sales || 0);
        }
        return a.name.localeCompare(b.name);
    });

    // Paginate Restaurants
    const totalRestaurantPages = Math.ceil(sortedRestaurants.length / ITEMS_PER_PAGE);
    const paginatedRestaurants = sortedRestaurants.slice(
        (restaurantPage - 1) * ITEMS_PER_PAGE,
        restaurantPage * ITEMS_PER_PAGE
    );

    // Filter Users logic
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            (u.restaurant && u.restaurant.name.toLowerCase().includes(userSearch.toLowerCase()));
        
        const matchesStatus = userStatusFilter === 'All' ||
            (userStatusFilter === 'active' && u.is_active) ||
            (userStatusFilter === 'inactive' && !u.is_active);

        const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Paginate Users
    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (userPage - 1) * ITEMS_PER_PAGE,
        userPage * ITEMS_PER_PAGE
    );

    // Reset pagination when filters change
    React.useEffect(() => {
        setRestaurantPage(1);
    }, [restaurantSearch, restaurantStatusFilter, sortBy]);

    React.useEffect(() => {
        setUserPage(1);
    }, [userSearch, userStatusFilter, userRoleFilter]);

    // Recharts Data Prep
    const userRolesData = [
        { name: 'Administradores', value: users.filter(u => u.role === 'admin').length },
        { name: 'Meseros', value: users.filter(u => u.role === 'waiter').length }
    ];

    const restaurantSizeData = restaurants.map(r => ({
        name: r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name,
        mesas: r.tables_count,
        platos: r.products_count
    })).slice(0, 5);

    // Sales ranking chart data
    const salesRankingData = [...restaurants]
        .map(r => ({
            name: r.name.length > 10 ? r.name.substring(0, 10) + '...' : r.name,
            ventas: Number(r.total_sales || 0)
        }))
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5);

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl shadow-xl text-xs">
                    <p className="font-bold text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-orange-400 font-extrabold mt-1">
                        {payload[0].value} usuarios ({((payload[0].value / (users.length || 1)) * 100).toFixed(0)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-150 font-sans relative overflow-hidden bg-mesh-radial selection:bg-orange-600 selection:text-white pb-20 transition-colors duration-200">
            <Head title="Super Admin Dashboard - bocado!" />

            {/* Ambient glows */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Floating Capsule Header */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 sm:px-6 w-full max-w-7xl mx-auto transition-transform duration-300">
                <header className={`backdrop-blur-xl border rounded-3xl px-6 flex items-center justify-between transition-all duration-300 hover:shadow-orange-500/5 hover:border-orange-500/20 ${
                    scrolled 
                        ? 'py-2 bg-white/85 dark:bg-gray-900/85 border-orange-500/20 dark:border-orange-500/30 scale-[0.98] shadow-xl shadow-orange-500/5' 
                        : 'py-3.5 bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-850 shadow-lg'
                }`}>
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                            bocado! administración
                        </h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            Super Administrador Global
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all"
                            title="Cambiar tema"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Moon className="w-4 h-4 text-indigo-500" />
                            )}
                        </button>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{auth.user.email}</span>
                        <Link
                            method="post"
                            href={route('logout')}
                            as="button"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-650 dark:bg-gray-800 dark:hover:bg-red-950/40 dark:hover:text-red-400 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 transition-all border border-gray-200 dark:border-gray-700"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Cerrar Sesión
                        </Link>
                    </div>
                </header>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-24 pb-10 space-y-10 relative z-10">
                {/* Intro */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Consola de Control de la Plataforma</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Supervisión en vivo de los negocios y cuentas vinculadas.</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-850 flex gap-1 self-start md:self-center">
                        <button 
                            onClick={() => setActiveTab('restaurants')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'restaurants' 
                                    ? 'bg-orange-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-250 dark:hover:bg-gray-850 hover:bg-gray-200'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Negocios ({restaurants.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === 'users' 
                                    ? 'bg-orange-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-250 dark:hover:bg-gray-850 hover:bg-gray-200'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Usuarios ({users.length})
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-sm flex items-center justify-between transition-all duration-200">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Restaurantes</p>
                            <h4 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{restaurants.length}</h4>
                            <span className="text-[10px] text-orange-400 font-semibold mt-1 block">Locales en el sistema</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-400 flex items-center justify-center">
                            <Store className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-sm flex items-center justify-between transition-all duration-200">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Usuarios Totales</p>
                            <h4 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{totalUsers}</h4>
                            <span className="text-[10px] text-amber-500 font-semibold mt-1 block">Admins & meseros</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                            <UserCheck className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-sm flex items-center justify-between transition-all duration-200">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Platos / Menús</p>
                            <h4 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{totalProducts}</h4>
                            <span className="text-[10px] text-green-400 font-semibold mt-1 block">Carta consolidada</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center">
                            <Utensils className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-sm flex items-center justify-between transition-all duration-200">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Mesas QRs</p>
                            <h4 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">{totalTables}</h4>
                            <span className="text-[10px] text-blue-400 font-semibold mt-1 block">Códigos QR generados</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Smartphone className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Dashboard Charts for Super Admin */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Roles Chart */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-md flex flex-col justify-between transition-all duration-200">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PieIcon className="w-4 h-4 text-orange-500" />
                                Distribución de Usuarios
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1">Proporción de administradores vs meseros</p>
                        </div>
                        
                        {users.length === 0 ? (
                            <div className="h-48 flex items-center justify-center">
                                <p className="text-xs text-gray-500">Sin datos de usuarios</p>
                            </div>
                        ) : (
                            <div className="h-48 w-full flex items-center justify-center">
                                <div className="w-1/2 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={userRolesData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {userRolesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 flex flex-col justify-center gap-2 text-xs">
                                    {userRolesData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                            <span className="font-semibold text-gray-700 dark:text-gray-350 truncate">{entry.name}</span>
                                            <span className="text-gray-500">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Restaurant Size comparison chart */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-md flex flex-col justify-between transition-all duration-200">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-blue-500" />
                                Tamaño de Negocios
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1">Cantidad de platos y mesas activas</p>
                        </div>

                        {restaurants.length === 0 ? (
                            <div className="h-48 flex items-center justify-center">
                                <p className="text-xs text-gray-500">Sin datos de negocios</p>
                            </div>
                        ) : (
                            <div className="h-48 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={restaurantSizeData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                            labelStyle={{ color: '#white', fontWeight: 'bold', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="platos" fill="#f97316" radius={[4, 4, 0, 0]} name="Platos" />
                                        <Bar dataKey="mesas" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mesas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* SaaS Sales Ranking Chart */}
                    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl shadow-md flex flex-col justify-between transition-all duration-200">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                Top Ventas del SaaS
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-1">Negocios con mayor facturación cobrada ($)</p>
                        </div>

                        {restaurants.length === 0 ? (
                            <div className="h-48 flex items-center justify-center">
                                <p className="text-xs text-gray-500">Sin datos de ventas</p>
                            </div>
                        ) : (
                            <div className="h-48 w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesRankingData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                            labelStyle={{ color: '#white', fontWeight: 'bold', fontSize: '10px' }}
                                        />
                                        <Bar dataKey="ventas" fill="#10b981" radius={[4, 4, 0, 0]} name="Ventas ($)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area with Filters & Actions */}
                {activeTab === 'restaurants' ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-3xl overflow-hidden shadow-md space-y-4 transition-all duration-200">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                <h3 className="text-md font-bold text-gray-900 dark:text-white">Negocios Vinculados</h3>
                            </div>
                            
                            {/* Filters row */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {/* Sorting selector */}
                                <div className="flex bg-gray-100 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-1 items-center">
                                    <button 
                                        onClick={() => setSortBy('sales')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                            sortBy === 'sales' 
                                                ? 'bg-green-600 text-white shadow' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <DollarSign className="w-3 h-3" />
                                        Facturación
                                    </button>
                                    <button 
                                        onClick={() => setSortBy('name')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                            sortBy === 'name' 
                                                ? 'bg-green-600 text-white shadow' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        Nombre
                                    </button>
                                </div>

                                <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <button 
                                        onClick={() => setRestaurantStatusFilter('All')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            restaurantStatusFilter === 'All' 
                                                ? 'bg-orange-600 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button 
                                        onClick={() => setRestaurantStatusFilter('active')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            restaurantStatusFilter === 'active' 
                                                ? 'bg-green-600 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Activos
                                    </button>
                                    <button 
                                        onClick={() => setRestaurantStatusFilter('inactive')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            restaurantStatusFilter === 'inactive' 
                                                ? 'bg-red-650 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Suspendidos
                                    </button>
                                </div>

                                <div className="relative flex-1 sm:w-64">
                                    <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o dirección..."
                                        value={restaurantSearch}
                                        onChange={(e) => setRestaurantSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 text-gray-900 dark:text-white rounded-xl focus:ring-1 focus:ring-orange-550 focus:border-orange-550 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Nombre del Negocio</th>
                                        <th className="px-6 py-4 text-center">Ventas Cobradas</th>
                                        <th className="px-6 py-4 text-center">Platillos</th>
                                        <th className="px-6 py-4 text-center">Mesas</th>
                                        <th className="px-6 py-4 text-center">Meseros</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4">Fecha de Alta</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm text-gray-750 dark:text-gray-300">
                                    {paginatedRestaurants.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron negocios con esos criterios de búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRestaurants.map((restaurant) => (
                                            <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/30 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {restaurant.name}
                                                        {!restaurant.is_active && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-500/10 text-red-400 font-black border border-red-500/20">
                                                                Suspendido
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{restaurant.address || 'Sin dirección registrada.'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-extrabold text-green-400 text-sm">
                                                        ${Number(restaurant.total_sales || 0).toFixed(2)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                        {restaurant.sales_count || 0} pedidos cobrados
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-extrabold text-orange-400">
                                                    {restaurant.products_count}
                                                </td>
                                                <td className="px-6 py-4 text-center font-extrabold text-amber-500">
                                                    {restaurant.tables_count}
                                                </td>
                                                <td className="px-6 py-4 text-center font-extrabold text-gray-400">
                                                    {restaurant.waiters_count}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        restaurant.is_active 
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {restaurant.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {new Date(restaurant.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => setViewingRestaurant(restaurant)}
                                                            className="p-2 text-gray-400 hover:bg-gray-800 rounded-xl transition-all"
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleRestaurant(restaurant.id, restaurant.name, restaurant.is_active)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                                restaurant.is_active
                                                                    ? 'bg-red-950/20 hover:bg-red-650 hover:text-white text-red-400 border border-red-900/30'
                                                                    : 'bg-green-950/20 hover:bg-green-650 hover:text-white text-green-400 border border-green-900/30'
                                                            }`}
                                                        >
                                                            {restaurant.is_active ? (
                                                                <>
                                                                    <PowerOff className="w-3.5 h-3.5" />
                                                                    Desactivar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="w-3.5 h-3.5" />
                                                                    Activar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Restaurant Pagination */}
                        {totalRestaurantPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-850 p-6">
                                <p className="text-xs text-gray-500">
                                    Mostrando <span className="font-semibold">{paginatedRestaurants.length}</span> de <span className="font-semibold">{filteredRestaurants.length}</span> locales
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setRestaurantPage(prev => Math.max(prev - 1, 1))}
                                        disabled={restaurantPage === 1}
                                        className="p-1.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-500 dark:text-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold px-3 text-gray-400">
                                        Página {restaurantPage} de {totalRestaurantPages}
                                    </span>
                                    <button
                                        onClick={() => setRestaurantPage(prev => Math.min(prev + 1, totalRestaurantPages))}
                                        disabled={restaurantPage === totalRestaurantPages}
                                        className="p-1.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-500 dark:text-gray-400"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-md space-y-4 transition-all duration-200">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-orange-500" />
                                <h3 className="text-md font-bold text-gray-900 dark:text-white">Gestión de Cuentas de Usuarios</h3>
                            </div>
                            
                            {/* User Filters Row */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {/* Role filter */}
                                <select 
                                    value={userRoleFilter} 
                                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-750 dark:text-gray-400 rounded-xl focus:ring-orange-500 focus:outline-none"
                                >
                                    <option value="All">Todos los Roles</option>
                                    <option value="admin">Administradores</option>
                                    <option value="waiter">Meseros</option>
                                </select>

                                {/* Active status filter */}
                                <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <button 
                                        onClick={() => setUserStatusFilter('All')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            userStatusFilter === 'All' 
                                                ? 'bg-orange-600 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button 
                                        onClick={() => setUserStatusFilter('active')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            userStatusFilter === 'active' 
                                                ? 'bg-green-600 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Activos
                                    </button>
                                    <button 
                                        onClick={() => setUserStatusFilter('inactive')}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            userStatusFilter === 'inactive' 
                                                ? 'bg-red-650 text-white' 
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Bloqueados
                                    </button>
                                </div>

                                <div className="relative flex-1 sm:w-64">
                                    <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuario o restaurante..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-1 focus:ring-orange-550 focus:border-orange-550 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Negocio / Restaurante</th>
                                        <th className="px-6 py-4">Rol / Permisos</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4">Creado el</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm text-gray-750 dark:text-gray-300">
                                    {paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron cuentas que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-850/30 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {user.name}
                                                        {!user.is_active && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-500/10 text-red-400 font-black border border-red-500/20">
                                                                Bloqueado
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 dark:text-white font-semibold">
                                                        {user.restaurant ? user.restaurant.name : (
                                                            <span className="text-gray-500 text-xs italic">Plataforma Global</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                                        user.role === 'admin' 
                                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' 
                                                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/15'
                                                    }`}>
                                                        {user.role === 'admin' ? 'Administrador' : 'Mesero / Staff'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        user.is_active 
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => setViewingUser(user)}
                                                            className="p-2 text-gray-400 hover:bg-gray-800 rounded-xl transition-all"
                                                            title="Ver Detalle"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUser(user.id, user.name, user.is_active)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                                user.is_active
                                                                    ? 'bg-red-950/20 hover:bg-red-650 hover:text-white text-red-400 border border-red-900/30'
                                                                    : 'bg-green-950/20 hover:bg-green-650 hover:text-white text-green-400 border border-green-900/30'
                                                            }`}
                                                        >
                                                            {user.is_active ? (
                                                                <>
                                                                    <PowerOff className="w-3.5 h-3.5" />
                                                                    Bloquear
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="w-3.5 h-3.5" />
                                                                    Habilitar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Users Pagination */}
                        {totalUserPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 p-6">
                                <p className="text-xs text-gray-500">
                                    Mostrando <span className="font-semibold">{paginatedUsers.length}</span> de <span className="font-semibold">{filteredUsers.length}</span> usuarios
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                                        disabled={userPage === 1}
                                        className="p-1.5 rounded-lg bg-gray-950 border border-gray-850 hover:bg-gray-800 disabled:opacity-50 text-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold px-3 text-gray-400">
                                        Página {userPage} de {totalUserPages}
                                    </span>
                                    <button
                                        onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                                        disabled={userPage === totalUserPages}
                                        className="p-1.5 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850 disabled:opacity-50 text-gray-500 dark:text-gray-400"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Viewing Restaurant Detail Modal */}
            {viewingRestaurant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-gray-800 dark:text-gray-200">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                Ficha de Negocio
                            </h3>
                            <button onClick={() => setViewingRestaurant(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Nombre comercial</span>
                                <span className="font-bold text-gray-900 dark:text-gray-900 dark:text-white text-base">{viewingRestaurant.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Estado del Local</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    viewingRestaurant.is_active 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                    {viewingRestaurant.is_active ? 'Activo' : 'Suspendido'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-850">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Dirección física</span>
                                    <span className="text-gray-300 font-semibold">{viewingRestaurant.address || 'No registrada'}</span>
                                </div>
                            </div>

                            {viewingRestaurant.phone && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-850">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <span className="text-[10px] text-gray-500 block font-bold uppercase">Teléfono de contacto</span>
                                        <span className="text-gray-300 font-semibold">{viewingRestaurant.phone}</span>
                                    </div>
                                </div>
                            )}

                            {/* SaaS Sales metric in modal */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Facturación SaaS</span>
                                    <span className="text-green-400 font-extrabold text-base">
                                        ${Number(viewingRestaurant.total_sales || 0).toFixed(2)}
                                        <span className="text-xs text-gray-500 font-medium ml-1">
                                            ({viewingRestaurant.sales_count || 0} pedidos cobrados)
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-850 text-center">
                                    <span className="text-[10px] text-gray-500 block">Platillos</span>
                                    <span className="text-base font-extrabold text-orange-400">{viewingRestaurant.products_count}</span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-850 text-center">
                                    <span className="text-[10px] text-gray-500 block">Mesas QR</span>
                                    <span className="text-base font-extrabold text-blue-400">{viewingRestaurant.tables_count}</span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-850 text-center">
                                    <span className="text-[10px] text-gray-500 block">Meseros</span>
                                    <span className="text-base font-extrabold text-gray-300">{viewingRestaurant.waiters_count}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-850">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Fecha de Incorporación</span>
                                    <span className="text-gray-300 font-semibold">
                                        {new Date(viewingRestaurant.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setViewingRestaurant(null)}
                                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewing User Detail Modal */}
            {viewingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-gray-800 dark:text-gray-200">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                <UserCheck className="w-5 h-5 text-orange-500" />
                                Perfil de Usuario
                            </h3>
                            <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex flex-col items-center py-2">
                                <div className="w-16 h-16 rounded-full bg-orange-600/10 text-orange-400 font-black text-2xl flex items-center justify-center shadow-inner mb-2 border border-orange-500/15">
                                    {viewingUser.name.substring(0, 2).toUpperCase()}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-gray-900 dark:text-white text-base">{viewingUser.name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                                    viewingUser.is_active 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                    {viewingUser.is_active ? 'Cuenta Habilitada' : 'Cuenta Bloqueada'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-850">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Correo Electrónico</span>
                                    <span className="text-gray-300 font-semibold">{viewingUser.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Negocio Vinculado</span>
                                    <span className="text-gray-300 font-semibold">
                                        {viewingUser.restaurant ? viewingUser.restaurant.name : 'Plataforma Global (SuperAdmin)'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <div>
                                    <span className="text-[10px] text-gray-500 block font-bold uppercase">Registrado el</span>
                                    <span className="text-gray-300 font-semibold">
                                        {new Date(viewingUser.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setViewingUser(null)}
                                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
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
        </div>
    );
}
