# Informe 5 — Configuración y librerías externas

> Este informe documenta **de qué me apoyo y cómo está configurado todo**: las dependencias externas (backend y frontend), qué hace cada una, los ficheros de configuración y las variables de entorno. También la configuración de la PWA.

---

## 1. Dependencias del backend (Composer)

### De producción (`require`)

| Librería | Para qué la uso |
|---|---|
| **laravel/framework** | El framework completo (rutas, Eloquent, validación…). Es la base. |
| **laravel/sanctum** | Autenticación por **tokens** (el login del SPA). |
| **spatie/laravel-permission** | **Roles y permisos** (admin, artista, espectador). |
| **symfony/brevo-mailer** | Enviar los **correos** por la API de Brevo (verificación, recordatorios, contraseña). |
| **symfony/http-client** | Cliente HTTP que necesita Brevo para hablar con su API. |
| **laravel/tinker** | Consola interactiva para probar código (desarrollo/depuración). |

### De desarrollo (`require-dev`) — no van a producción

| Librería | Para qué |
|---|---|
| **phpunit/phpunit** | Ejecutar los **tests** automáticos. |
| **fakerphp/faker** | Generar datos falsos en las factories/tests. |
| **mockery/mockery** | Simular objetos en los tests. |
| **laravel/sail** | **Docker** para el entorno de desarrollo local. |
| **laravel/pint** | Formateador de estilo de código. |
| **laravel/pail** | Ver los logs en vivo durante el desarrollo. |
| **nunomaduro/collision** | Mostrar los errores de consola de forma legible. |
| **laravel/breeze** | Scaffolding de autenticación inicial (quedan restos sin usar; ver Informe 2). |

---

## 2. Dependencias del frontend (npm)

### De producción (`dependencies`)

| Librería | Para qué la uso |
|---|---|
| **react** + **react-dom** | La librería de interfaz. El núcleo de la SPA. |
| **react-router-dom** | El **enrutado** (navegación entre páginas sin recargar). |
| **leaflet** + **react-leaflet** | Los **mapas** (OpenStreetMap, gratis y sin clave). |
| **qrcode.react** | Generar el **QR** del artista en el navegador. |

> Nota: **`axios` está instalado pero NO se usa.** Toda la comunicación con la API va con `fetch` encapsulado en el hook `useAPI`. Es una dependencia que quedó de pruebas iniciales.

### De desarrollo (`devDependencies`)

| Librería | Para qué |
|---|---|
| **vite** | El **bundler** y servidor de desarrollo (rápido). |
| **@vitejs/plugin-react** | Soporte de React en Vite. |
| **vite-plugin-pwa** | Convierte la web en **PWA instalable** (genera el service worker y el manifest). |
| **sass** | Compilar los estilos **SCSS**. |
| **eslint** + plugins (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) | El **linter**: detecta errores y malas prácticas en el código. |
| **@types/react**, **@types/react-dom** | Tipados para mejor autocompletado. |

---

## 3. Ficheros de configuración del backend (`config/`)

| Fichero | Qué configura |
|---|---|
| `app.php` | Nombre, **idioma (español)**, zona horaria (Europe/Madrid), `frontend_url`, y el forzado de HTTPS en producción. |
| `auth.php` | Los guards y el **broker de contraseñas** (recuperar contraseña). |
| `cors.php` | Los **orígenes permitidos** para la API (nuestro frontend y local). |
| `database.php` | Las conexiones de base de datos (usamos **PostgreSQL**). |
| `mail.php` | Los "mailers"; aquí está dado de alta el de **Brevo**. |
| `sanctum.php` | Configuración de los **tokens** de sesión. |
| `permission.php` | Configuración de **Spatie** (roles/permisos). |
| `services.php`, `cache.php`, `queue.php`, `session.php`, `filesystems.php`, `logging.php` | Configuración interna de servicios de Laravel. |

---

## 4. Variables de entorno (las que usamos de verdad)

Los **secretos y la configuración por entorno** no están en el código, sino en variables de entorno (en local en `.env`, en producción en el panel de Railway):

| Variable | Para qué |
|---|---|
| `APP_KEY` | Clave de cifrado de la app |
| `APP_ENV` / `APP_DEBUG` | Entorno (production) y modo depuración (false en prod) |
| `APP_URL` | URL del backend (Railway) — importante para las URLs firmadas |
| `APP_TIMEZONE` / `APP_LOCALE` | Europe/Madrid / es |
| `FRONTEND_URL` | URL del frontend (Vercel) — para redirecciones y enlaces de los correos |
| `DB_CONNECTION` / `DB_URL` | PostgreSQL (la cadena de conexión de Neon) |
| `MAIL_MAILER` (`brevo`) / `BREVO_KEY` | Envío de correos por Brevo |
| `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` | Remitente de los correos |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | El usuario admin que crea el seeder de producción |

> Regla de oro: **ningún secreto se sube a Git.** Si alguien clonara el repo, no tendría acceso a la base de datos ni al correo.

---

## 5. Configuración de la PWA (web instalable)

La PWA se configura en `vite.config.js` con **vite-plugin-pwa**:

- **`manifest`**: los datos de la app (nombre "Libitum", color de marca teal, fondo crema, e **iconos** de 192 y 512 px). Esto es lo que el navegador usa para el "Instalar".
- **`registerType: 'autoUpdate'`**: los usuarios reciben **siempre la última versión** automáticamente, sin tener que limpiar caché.
- El plugin genera en el build un **service worker** (`sw.js`) que cachea la "shell" de la app, y lo registra solo.

Además:
- En `index.html` añadí las meta tags de **theme-color** y de **apple-touch-icon** (para el "Añadir a inicio" de iPhone).
- Un componente **`InstallButton`** muestra el botón "📲 Instalar" solo cuando la app se puede instalar (y da instrucciones en iOS).

> Requisito que ya cumplimos: una PWA necesita **HTTPS**, que Vercel da por defecto.

---

## 6. Resumen

- **Backend:** pocas dependencias y bien elegidas — Laravel + Sanctum (auth) + Spatie (roles) + Brevo (correo). Las de desarrollo (tests, Docker, linter) no van a producción.
- **Frontend:** React + Router + Leaflet (mapas) + qrcode, con Vite como motor y vite-plugin-pwa para hacerla **instalable**.
- **Configuración:** los ficheros de `config/` ajustan cada servicio; los **secretos viven en variables de entorno**, nunca en el código.

> Siguiente: **Informe 6 — Batch / tareas programadas**, donde explico a fondo el comando de recordatorios y el cron.
