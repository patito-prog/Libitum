# Libitum 🎶

**Plataforma de gestión y descubrimiento de eventos musicales.**

Libitum conecta artistas y espectadores: los artistas publican y gestionan sus eventos, los espectadores los descubren, se inscriben y siguen a sus artistas favoritos. Incluye sistema de donaciones con QR, feed personalizado con scroll infinito, panel de administración y recordatorios por email.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12 · PHP 8.5 · Laravel Sanctum · Spatie Permissions |
| Base de datos | PostgreSQL 18 |
| Frontend | React 19 · Vite · React Router DOM 7 · SCSS Modules |
| Infraestructura | Docker · Laravel Sail |
| Email | Laravel Mail (log en dev, SMTP en prod) |
| Mapas | Google Maps API · Places Autocomplete |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- [Node.js](https://nodejs.org/) 20 o superior
- Git

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Libitum
```

### 2. Configurar y levantar el backend

```bash
cd backend

# Copiar el fichero de variables de entorno
cp .env.example .env

# Instalar dependencias PHP (sin Docker local, usa la imagen de Sail)
docker run --rm -u "$(id -u):$(id -g)" \
  -v "$(pwd):/var/www/html" \
  -w /var/www/html \
  laravelsail/php85-composer:latest \
  composer install --ignore-platform-reqs

# Levantar los contenedores (Laravel + PostgreSQL)
docker compose up -d

# Generar la clave de la aplicación
docker compose exec laravel.test php artisan key:generate

# Ejecutar migraciones y poblar la base de datos con datos de demo
docker compose exec laravel.test php artisan migrate --seed
```

El backend estará disponible en **http://localhost:80**

### 3. Configurar y levantar el frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

Crear el fichero `.env` en la carpeta `frontend/` con el siguiente contenido:

```env
VITE_API_URL=http://localhost
VITE_GOOGLE_MAPS_KEY=tu_api_key_de_google_maps
```

> **Nota sobre Google Maps**: la API Key se necesita para mostrar el mapa en el detalle de evento y el autocompletado de ubicación al crear eventos. Sin ella el resto de la aplicación funciona con normalidad.

```bash
# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en **http://localhost:5173**

---

## Credenciales de demo

Tras ejecutar `migrate --seed` se crean estos usuarios listos para usar:

| Rol | Email | Contraseña |
|---|---|---|
| **Admin** | admin@libitum.com | 123456 |
| **Artista** | mozart@libitum.com | 123456 |

El seeder también crea **10 artistas** con eventos y **20 espectadores** con inscripciones aleatorias para que el feed tenga contenido desde el primer momento.

---

## Estructura del proyecto

```
Libitum/
├── backend/                  # API Laravel 12
│   ├── app/
│   │   ├── Console/Commands/ # Comandos Artisan (ej: reminders:send)
│   │   ├── Http/
│   │   │   ├── Controllers/  # Lógica de cada endpoint
│   │   │   ├── Middleware/   # AdminMiddleware, IsArtist
│   │   │   └── Requests/     # Validación de formularios (FormRequests)
│   │   ├── Mail/             # Mailables (EventReminder)
│   │   └── Models/           # Eloquent: User, Event, ArtistProfile...
│   ├── database/
│   │   ├── factories/        # Generadores de datos de prueba
│   │   ├── migrations/       # Esquema de la BD
│   │   └── seeders/          # Datos iniciales y de demo
│   ├── resources/views/emails/ # Plantillas de email (Blade)
│   ├── routes/
│   │   ├── api.php           # Todos los endpoints REST
│   │   └── console.php       # Comandos y tareas programadas
│   └── tests/Feature/        # Tests de integración de la API
│
└── frontend/                 # SPA React 19
    └── src/
        ├── components/       # Componentes reutilizables
        │   ├── admin/        # Panel de administración
        │   ├── common/       # Loader, Skeleton, Modal...
        │   ├── layout/       # Header, Footer
        │   └── profile/      # Componentes de perfil de usuario/artista
        ├── context/          # AuthProvider, EventProvider, MessageProvider
        ├── hooks/            # useAPI, useAuthContext, useAdminDashboard...
        ├── pages/
        │   ├── private/      # Páginas que requieren autenticación
        │   │   └── artist/   # QR, Estadísticas
        │   └── public/       # Home, Login, Register, Perfil, Evento
        └── routes/           # Router con guards (PrivateRoute, AdminRoute)
```

---

## Endpoints de la API

### Públicos (sin token)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/login` | Iniciar sesión |
| `POST` | `/api/register` | Registro de nuevo usuario |
| `GET` | `/api/events/search` | Búsqueda paginada de eventos |
| `GET` | `/api/events/{id}` | Detalle de un evento |
| `GET` | `/api/artists/{id}` | Perfil público del artista (QR/donación) |
| `GET` | `/api/users/{id}` | Perfil social de cualquier usuario |
| `GET` | `/api/categories` | Lista de categorías |
| `GET` | `/api/statuses` | Lista de estados de evento |

### Autenticados (requieren token Sanctum)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/logout` | Cerrar sesión |
| `GET` | `/api/feed` | Feed personalizado (`?mode=discover\|following`) |
| `GET` | `/api/user/events` | Eventos a los que el usuario está inscrito |
| `POST` | `/api/user/event` | Inscribirse en un evento |
| `DELETE` | `/api/user/{event}` | Cancelar inscripción |
| `PATCH` | `/api/user/{event}/remind_me` | Activar/desactivar recordatorio |
| `POST` | `/api/events/{event}/like` | Dar/quitar me gusta a un evento |
| `POST` | `/api/artist/{id}/follow` | Seguir a un artista |
| `DELETE` | `/api/artist/{id}/unfollow` | Dejar de seguir a un artista |
| `PATCH` | `/api/profile` | Editar perfil (nombre, email, ciudad, avatar) |
| `PATCH` | `/api/profile/password` | Cambiar contraseña |
| `POST` | `/api/profile/avatar` | Subir foto de perfil |

### Solo artistas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/events` | Listar eventos propios (incluye borradores) |
| `POST` | `/api/events` | Crear evento |
| `PUT` | `/api/events/{id}` | Editar evento |
| `DELETE` | `/api/events/{id}` | Eliminar evento |
| `POST` | `/api/events/{id}/cover` | Subir imagen de portada |
| `PATCH` | `/api/events/{id}/status` | Cambiar estado del evento |
| `PATCH` | `/api/artist-profile` | Editar bio, redes sociales y enlace de donación |
| `GET` | `/api/artist/statistics` | Estadísticas del artista |

### Solo administradores

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/admin/users` | Listar usuarios (paginado, `?search=`) |
| `PATCH` | `/api/admin/users/{id}` | Editar usuario o cambiar rol |
| `DELETE` | `/api/admin/users/{id}` | Eliminar usuario |
| `GET` | `/api/admin/events` | Listar todos los eventos |
| `DELETE` | `/api/admin/events/{id}` | Eliminar cualquier evento |

---

## Tests

```bash
# Ejecutar todos los tests
docker compose exec laravel.test php artisan test

# Ejecutar solo los tests de la API que hemos escrito
docker compose exec laravel.test php artisan test tests/Feature/EventTest.php tests/Feature/FeedTest.php tests/Feature/InscriptionTest.php tests/Feature/FollowTest.php tests/Feature/AdminTest.php
```

Los tests usan `RefreshDatabase` — cada test trabaja sobre una base de datos limpia y no interfiere con los demás.

---

## Recordatorios por email

La aplicación incluye un sistema de recordatorios automáticos. Los usuarios pueden activar un recordatorio en cada evento al que están inscritos (sección **Mis Asistencias**). El sistema envía un email 24 horas antes del evento.

```bash
# Ejecutar manualmente (para probar)
docker compose exec laravel.test php artisan reminders:send

# Ver el email generado en desarrollo (driver: log)
docker compose exec laravel.test tail -f storage/logs/laravel.log
```

En producción, añadir esta línea al cron del servidor para que el scheduler funcione:

```
* * * * * cd /ruta/al/proyecto/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Variables de entorno relevantes

### Backend (`backend/.env`)

| Variable | Descripción | Valor de desarrollo |
|---|---|---|
| `APP_URL` | URL base del backend | `http://localhost` |
| `DB_HOST` | Host de PostgreSQL | `pgsql` (nombre del servicio Docker) |
| `DB_DATABASE` | Nombre de la base de datos | `libitum` |
| `MAIL_MAILER` | Driver de email | `log` (dev) · `smtp` (prod) |
| `MAIL_FROM_ADDRESS` | Remitente de los emails | `noreply@libitum.com` |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend (sin barra final) |
| `VITE_GOOGLE_MAPS_KEY` | API Key de Google Maps |

---

## Autores

Proyecto de Fin de Ciclo — Desarrollo de Aplicaciones Web

- **Irene** — Backend (Laravel), modularización React, arquitectura general
- **Álvaro** — Frontend (React), diseño UI/UX, sistema de asistencias

---

> Desarrollado con Laravel 12 y React 19.
