import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { 
    Terminal, Key, Utensils, QrCode, ClipboardList, Clock, 
    DollarSign, ChevronRight, Copy, Check, Info, ShieldAlert 
} from 'lucide-react';

export default function ApiDocs() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [id]: false }));
        }, 2000);
    };

    const sections = [
        { id: 'getting-started', label: 'Introducción', icon: Info },
        { id: 'authentication', label: 'Autenticación', icon: Key },
        { id: 'restaurants', label: 'Restaurantes y Menús', icon: Utensils },
        { id: 'tables', label: 'Mesas y QRs', icon: QrCode },
        { id: 'orders', label: 'Pedidos y Pagos', icon: ClipboardList },
        { id: 'shifts', label: 'Turnos de Meseros', icon: Clock },
        { id: 'cash-sessions', label: 'Arqueo de Caja', icon: DollarSign },
    ];

    interface EndpointItem {
        method: string;
        path: string;
        description: string;
        payload: string | null;
        response: string;
        authRequired?: boolean;
    }

    const endpoints: { [key: string]: EndpointItem[] } = {
        'authentication': [
            {
                method: 'POST',
                path: '/api/auth/register',
                description: 'Registrar un nuevo usuario (mesero o administrador de restaurante).',
                payload: `{
  "name": "Carlos Gomez",
  "email": "carlos@restaurante.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "waiter",
  "phone": "3001234567",
  "city": "Bogotá"
}`,
                response: `{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "1|qW8Fp...",
    "user": {
      "id": 5,
      "name": "Carlos Gomez",
      "email": "carlos@restaurante.com",
      "role": "waiter",
      "restaurant_id": null
    }
  }
}`
            },
            {
                method: 'POST',
                path: '/api/auth/login',
                description: 'Autenticar un usuario existente y obtener el token de acceso API.',
                payload: `{
  "email": "carlos@restaurante.com",
  "password": "password123"
}`,
                response: `{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "2|zT9Pl...",
    "user": {
      "id": 5,
      "name": "Carlos Gomez",
      "email": "carlos@restaurante.com",
      "role": "waiter",
      "restaurant_id": 1
    }
  }
}`
            },
            {
                method: 'GET',
                path: '/api/auth/me',
                description: 'Obtener la información del perfil del usuario autenticado actual.',
                authRequired: true,
                payload: null,
                response: `{
  "status": "success",
  "data": {
    "id": 5,
    "name": "Carlos Gomez",
    "email": "carlos@restaurante.com",
    "role": "waiter",
    "restaurant_id": 1,
    "experience_hours": 12.5,
    "average_rating": 4.8
  }
}`
            }
        ],
        'restaurants': [
            {
                method: 'GET',
                path: '/api/restaurants/{id}',
                description: 'Ver detalles de un restaurante en particular.',
                payload: null,
                response: `{
  "status": "success",
  "data": {
    "id": 1,
    "name": "El Bocado Dorado",
    "is_hiring": true,
    "waiters_can_collect_payment": true,
    "security_table_pin": true,
    "tables_count": 8,
    "waiters_count": 3
  }
}`
            },
            {
                method: 'GET',
                path: '/api/restaurants/{id}/menu',
                description: 'Listar productos y categorías de platos activos en el menú del restaurante.',
                payload: null,
                response: `{
  "status": "success",
  "data": {
    "restaurant_name": "El Bocado Dorado",
    "categories": {
      "Entradas": [
        {
          "id": 10,
          "name": "Empanaditas de Carne",
          "price": 12000,
          "is_available": true,
          "image_path": "/storage/products/empanadas.jpg"
        }
      ],
      "Bebidas": [
        {
          "id": 15,
          "name": "Limonada Cerezada",
          "price": 8500,
          "is_available": true
        }
      ]
    }
  }
}`
            }
        ],
        'tables': [
            {
                method: 'GET',
                path: '/api/tables/{qr_code_token}',
                description: 'Escaneo físico de una mesa. Obtiene el estado, menú y activa el código PIN de autopedido.',
                payload: null,
                response: `{
  "status": "success",
  "data": {
    "table": {
      "id": 3,
      "number": "Mesa 3",
      "status": "free",
      "temp_pin": "5824",
      "is_active_for_order": true
    },
    "restaurant": {
      "id": 1,
      "name": "El Bocado Dorado"
    }
  }
}`
            },
            {
                method: 'POST',
                path: '/api/tables/{table}/toggle-activation',
                description: 'Habilitar o deshabilitar la mesa para recibir autopedidos y regenerar/limpiar el PIN.',
                authRequired: true,
                payload: null,
                response: `{
  "status": "success",
  "message": "Mesa activada para autopedido.",
  "data": {
    "id": 3,
    "number": "Mesa 3",
    "is_active_for_order": true,
    "temp_pin": "9124"
  }
}`
            }
        ],
        'orders': [
            {
                method: 'POST',
                path: '/api/tables/{qr_code_token}/order',
                description: 'Enviar autopedido de cliente (requiere PIN correcto si la seguridad está activa).',
                payload: `{
  "pin": "5824",
  "items": [
    {
      "product_id": 10,
      "quantity": 2,
      "notes": "Bien tostadas"
    }
  ]
}`,
                response: `{
  "status": "success",
  "message": "Pedido enviado. Esperando aprobación del mesero.",
  "data": [
    {
      "product_id": 10,
      "name": "Empanaditas de Carne",
      "price": 12000,
      "quantity": 2,
      "notes": "Bien tostadas"
    }
  ]
}`
            },
            {
                method: 'POST',
                path: '/api/tables/{table}/waiter-order',
                description: 'Crear o actualizar la orden activa de una mesa por parte del mesero.',
                authRequired: true,
                payload: `{
  "items": [
    {
      "product_id": 10,
      "quantity": 2,
      "notes": "Bien tostadas"
    },
    {
      "product_id": 15,
      "quantity": 1
    }
  ]
}`,
                response: `{
  "status": "success",
  "message": "Pedido guardado exitosamente."
}`
            },
            {
                method: 'POST',
                path: '/api/tables/{table}/pay',
                description: 'Registrar cobro total en efectivo y liberar la mesa con un nuevo PIN dinámico.',
                authRequired: true,
                payload: `{
  "received_amount": 40000,
  "change_amount": 7500
}`,
                response: `{
  "status": "success",
  "message": "Mesa cobrada y liberada con éxito."
}`
            }
        ],
        'shifts': [
            {
                method: 'POST',
                path: '/api/waiter/shifts/start',
                description: 'Iniciar la jornada laboral (turno) del mesero autenticado.',
                authRequired: true,
                payload: null,
                response: `{
  "status": "success",
  "message": "Turno iniciado correctamente.",
  "data": {
    "id": 8,
    "user_id": 5,
    "started_at": "2026-06-13T08:15:00Z"
  }
}`
            },
            {
                method: 'POST',
                path: '/api/waiter/shifts/end',
                description: 'Finalizar la jornada laboral (turno) activa del mesero acumulando experiencia.',
                authRequired: true,
                payload: null,
                response: `{
  "status": "success",
  "message": "Turno finalizado correctamente.",
  "data": {
    "id": 8,
    "user_id": 5,
    "started_at": "2026-06-13T08:15:00Z",
    "ended_at": "2026-06-13T16:15:00Z"
  }
}`
            }
        ],
        'cash-sessions': [
            {
                method: 'GET',
                path: '/api/cash/status',
                description: 'Consultar el estado actual de la caja registradora (Abierta/Cerrada) y total acumulado.',
                authRequired: true,
                payload: null,
                response: `{
  "status": "success",
  "data": {
    "active_session": {
      "id": 2,
      "opening_balance": 150000,
      "opened_at": "2026-06-13T07:00:00Z"
    },
    "total_paid_amount": 345000
  }
}`
            },
            {
                method: 'POST',
                path: '/api/cash/open',
                description: 'Abrir una nueva sesión de caja registradora con saldo inicial.',
                authRequired: true,
                payload: `{
  "opening_balance": 150000
}`,
                response: `{
  "status": "success",
  "message": "Caja registradora abierta exitosamente.",
  "data": {
    "id": 3,
    "opening_balance": 150000,
    "opened_at": "2026-06-13T08:00:00Z"
  }
}`
            }
        ]
    };

    const getCurlCommand = (method: string, path: string, payload: string | null, auth: boolean = false) => {
        let cmd = `curl -X ${method} "https://bocado.click${path}" \\\n`;
        cmd += `  -H "Accept: application/json" \\\n`;
        cmd += `  -H "Content-Type: application/json"`;
        if (auth) {
            cmd += ` \\\n  -H "Authorization: Bearer <your_access_token>"`;
        }
        if (payload) {
            cmd += ` \\\n  -d '${payload.replace(/\n/g, '\n  ')}'`;
        }
        return cmd;
    };

    const getJsFetch = (method: string, path: string, payload: string | null, auth: boolean = false) => {
        let headers: any = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (auth) {
            headers['Authorization'] = 'Bearer <your_access_token>';
        }

        let js = `fetch('https://bocado.click${path}', {\n`;
        js += `  method: '${method}',\n`;
        js += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`;
        if (payload) {
            js += `,\n  body: JSON.stringify(${payload.replace(/\n/g, '\n  ')})`;
        }
        js += `\n})`;
        js += `\n  .then(res => res.json())\n  .then(data => console.log(data));`;
        return js;
    };

    return (
        <PublicLayout>
            <Head title="API Documentation - Bocado!" />
            
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="px-3 py-1 text-xs font-semibold tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/30 rounded-full">
                        Developer Hub
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 mb-6">
                        Documentación de la <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">API REST</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Integra tu aplicación móvil, tableta o plataforma de terceros con el ecosistema de Bocado!. Nuestra API te permite gestionar pedidos, mesas y turnos en tiempo real.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Navigation Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 h-fit bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Endpoints</h3>
                        <nav className="flex flex-col gap-1.5">
                            {sections.map(sec => {
                                const Icon = sec.icon;
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={() => {
                                            setActiveSection(sec.id);
                                            document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                                            activeSection === sec.id
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                                : 'text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeSection === sec.id ? 'text-white' : 'text-orange-500'}`} />
                                        {sec.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 space-y-16">
                        {/* Getting Started Section */}
                        <section id="getting-started" className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                                <Terminal className="w-6 h-6 text-orange-500" />
                                Primeros Pasos
                            </h2>
                            <p className="text-slate-650 dark:text-slate-350 leading-relaxed mb-6">
                                La API de Bocado! está diseñada con base en principios REST. Todas las peticiones deben realizarse a la URL base y devuelven respuestas en formato JSON.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/30">
                                    <h4 className="font-bold text-sm mb-2 text-slate-850 dark:text-white">URL Base de Desarrollo</h4>
                                    <code className="text-xs bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg block font-mono text-orange-600 dark:text-orange-400 border dark:border-slate-800">
                                        http://localhost/api
                                    </code>
                                </div>
                                <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/30">
                                    <h4 className="font-bold text-sm mb-2 text-slate-850 dark:text-white">Cabeceras Obligatorias</h4>
                                    <code className="text-xs bg-slate-100 dark:bg-slate-900 p-2.5 rounded-lg block font-mono text-slate-700 dark:text-slate-350 border dark:border-slate-800">
                                        Accept: application/json<br />
                                        Content-Type: application/json
                                    </code>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-950/30 rounded-2xl">
                                <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                                    <strong className="text-slate-850 dark:text-white">Seguridad de la API:</strong> Para los endpoints marcados con candado, se requiere enviar el Bearer Token en la cabecera <code className="font-mono text-xs text-orange-500 bg-orange-100/30 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> obtenido del endpoint de inicio de sesión.
                                </div>
                            </div>
                        </section>

                        {/* Resource Sections */}
                        {sections.filter(s => s.id !== 'getting-started').map(sec => {
                            const resourceEndpoints = endpoints[sec.id as keyof typeof endpoints] || [];
                            return (
                                <section 
                                    key={sec.id} 
                                    id={sec.id}
                                    className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-8 shadow-sm space-y-10"
                                >
                                    <div className="border-b dark:border-slate-800 pb-4">
                                        <h2 className="text-2xl font-black flex items-center gap-3">
                                            {React.createElement(sec.icon, { className: 'w-6 h-6 text-orange-500' })}
                                            {sec.label}
                                        </h2>
                                    </div>

                                    {resourceEndpoints.map((ep, idx) => {
                                        const uniqueId = `${sec.id}-${idx}`;
                                        const curlCommand = getCurlCommand(ep.method, ep.path, ep.payload, ep.authRequired);
                                        const jsCode = getJsFetch(ep.method, ep.path, ep.payload, ep.authRequired);
                                        const [activeTab, setActiveTab] = useState<'curl' | 'javascript'>('curl');

                                        return (
                                            <div key={idx} className="space-y-4 border-b last:border-0 dark:border-slate-800 pb-8 last:pb-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                                                        ep.method === 'GET' 
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                            : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                    }`}>
                                                        {ep.method}
                                                    </span>
                                                    <code className="text-sm font-black font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                                        {ep.path}
                                                    </code>
                                                    {ep.authRequired && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-500/10">
                                                            🔑 Token Requerido
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {ep.description}
                                                </p>

                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                    {/* Request Snippet panel */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-t-2xl border-b dark:border-slate-900">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setActiveTab('curl')}
                                                                    className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'curl' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                                                >
                                                                    cURL
                                                                </button>
                                                                <button
                                                                    onClick={() => setActiveTab('javascript')}
                                                                    className={`text-xs font-bold px-2 py-1 rounded-lg ${activeTab === 'javascript' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                                                >
                                                                    Javascript
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleCopy(activeTab === 'curl' ? curlCommand : jsCode, `${uniqueId}-req`)}
                                                                className="text-slate-400 hover:text-slate-650 dark:hover:text-white flex items-center gap-1 text-xs"
                                                            >
                                                                {copiedStates[`${uniqueId}-req`] ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                Copiar
                                                            </button>
                                                        </div>
                                                        <pre className="text-xs bg-slate-950 text-slate-200 p-4 rounded-b-2xl font-mono overflow-x-auto max-h-[300px] border border-slate-900">
                                                            <code>{activeTab === 'curl' ? curlCommand : jsCode}</code>
                                                        </pre>
                                                    </div>

                                                    {/* Response Panel */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 px-4 py-2 rounded-t-2xl border-b dark:border-slate-900">
                                                            <span className="text-xs font-bold text-slate-650 dark:text-slate-400">Response (200 OK)</span>
                                                            <button
                                                                onClick={() => handleCopy(ep.response, `${uniqueId}-res`)}
                                                                className="text-slate-400 hover:text-slate-650 dark:hover:text-white flex items-center gap-1 text-xs"
                                                            >
                                                                {copiedStates[`${uniqueId}-res`] ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                Copiar
                                                            </button>
                                                        </div>
                                                        <pre className="text-xs bg-slate-950 text-slate-200 p-4 rounded-b-2xl font-mono overflow-x-auto max-h-[300px] border border-slate-900">
                                                            <code>{ep.response}</code>
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
