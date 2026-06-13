# pídelo! - Sistema Web de Gestión y Pedidos en Tiempo Real

**pídelo!** es una plataforma web moderna, rápida y adaptada a móviles para la gestión de restaurantes, toma de pedidos por meseros y menú digital interactivo para clientes mediante escaneo de códigos QR.

---

## 🚀 Tecnologías Utilizadas

- **Backend**: Laravel 11 (PHP 8.3+)
- **Frontend**: React + TypeScript (Laravel Breeze + Inertia.js)
- **Base de Datos**: SQLite (por defecto, lista para usar sin configuraciones adicionales)
- **Estilos**: Tailwind CSS + Efectos 3D y radiales CSS
- **Compilador**: Vite + Rolldown
- **Pruebas**: Pest PHP Framework

---

## 🛠️ Guía de Instalación y Configuración

Sigue estos pasos para instalar y ejecutar el proyecto localmente en tu computadora:

### 1. Clonar o descargar el proyecto
Coloca el proyecto en tu directorio de trabajo (ej: `C:\Users\Mi Pc\Desktop\Proyectos\pidelo`).

### 2. Instalar dependencias del Backend (Composer)
Asegúrate de tener PHP y Composer instalados en tu PATH. Ejecuta:
```bash
composer install
```

### 3. Instalar dependencias del Frontend (NPM)
Instala las dependencias de Node.js resolviendo los conflictos de peer-dependencies del compilador:
```bash
npm install --legacy-peer-deps
```

### 4. Configurar variables de entorno
Crea tu archivo `.env` a partir del archivo de ejemplo:
```bash
copy .env.example .env
```
Genera la clave de la aplicación:
```bash
php artisan key:generate
```
*Nota: Por defecto, Laravel 11 viene configurado para usar una base de datos SQLite en `database/database.sqlite`. El instalador creará este archivo automáticamente.*

### 5. Correr Migraciones y Cargar Semillas (Seeders)
Ejecuta la migración limpia junto con las semillas para cargar todos los datos de prueba y cuentas necesarias:
```bash
php artisan migrate:fresh --seed
```

### 6. Compilar Assets de producción
Compila el código de React y TypeScript con Vite:
```bash
npm run build
```

---

## 💻 Cómo Iniciar los Servidores de Desarrollo

Para trabajar en el proyecto de forma local, debes ejecutar ambos servidores simultáneamente:

1. **Iniciar el servidor backend (Laravel)** (se ha configurado en el puerto 8001 para evitar conflictos):
   ```bash
   php artisan serve --port=8001
   ```
2. **Iniciar el servidor frontend (Vite)**:
   ```bash
   npm run dev
   ```

*Ingresa a tu navegador en [http://127.0.0.1:8001](http://127.0.0.1:8001)*

---

## 🔑 Credenciales de Prueba (Contraseña: `password` para todas)

La base de datos viene pre-poblada con los siguientes perfiles de demostración para realizar pruebas rápidas:

| Rol de Usuario | Correo Electrónico | Descripción de la Cuenta |
| :--- | :--- | :--- |
| **Super Administrador** | `kaledmoly@gmail.com` | Consola global de la web. Monitorea todos los restaurantes, platos, mesas y meseros creados. |
| **Administrador / Propietario** | `owner@rinconcito.com` | Administra "El Rinconcito Italiano" (platos, meseros, mesas y ve analíticas de ventas). |
| **Mesero 1 (Rinconcito)** | `pedro@rinconcito.com` | Interfaz móvil de mesero. Tiene asignado un pedido activo en la **Mesa 2**. |
| **Mesero 2 (Rinconcito)** | `maria@rinconcito.com` | Interfaz móvil de mesero. Tiene asignada una mesa pidiendo la cuenta en la **Mesa 3**. |
| **Administrador (Taco Loco)** | `owner@tacoloco.com` | Administrador del restaurante secundario "Taco Loco". |
| **Mesero 3 (Taco Loco)** | `carlos@tacoloco.com` | Mesero del restaurante secundario "Taco Loco". |

---

## 🍽️ Guía de Uso de los Flujos de la Web

### 1. Panel de Propietario (Restaurante)
- Inicia sesión como `owner@rinconcito.com`.
- Visualiza métricas financieras en tiempo real: ingresos cobrados, facturación pendiente, estado de mesas ocupadas/libres.
- Ve reportes de ventas clasificadas por mesa y mesero.
- Gestiona la carta de comidas y bebidas (puedes activar o desactivar platos agotados al instante).
- Registra cuentas secundarias de meseros y configura mesas.

### 2. Panel del Mesero (Móvil)
- Inicia sesión como `pedro@rinconcito.com` en tu móvil o navegador.
- Verás un mapa interactivo de mesas de tu restaurante.
- Haz clic en cualquier mesa vacía para iniciar un pedido o en una mesa ocupada para agregar más platos.
- Utiliza las pestañas de categorías y el buscador para añadir productos con un solo click.
- Controla cantidades (+ / -) e ingresa comentarios de preparación (ej. "Término medio", "Sin cebolla").
- Presiona **Guardar Pedido** para enviar a cocina y ocupar la mesa, o **Pedir Cuenta / Cobrar** para finalizar.

### 3. Escaneo QR por Clientes
- Cada mesa física tiene un código QR único que puedes obtener del panel de administración de mesas.
- Al escanear el QR:
  - **Si es un cliente**: Accederá al menú digital interactivo y verá en tiempo real un acordeón con los platos ingresados por su mesero y el total de la cuenta.
  - **Si es un mesero autenticado**: El sistema lo redirigirá directamente a la interfaz móvil de pedidos de esa mesa para agilizar el servicio.

---

## 🧪 Pruebas Automatizadas (Pest)

Puedes correr las pruebas funcionales del flujo de pedidos y registro de restaurantes usando:
```bash
php artisan test
```
