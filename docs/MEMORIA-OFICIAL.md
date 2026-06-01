# MEMORIA DEL PROYECTO — LIBITUM

> ⚠️ **ESTO ES UN BORRADOR/BASE.** Sigue la estructura exacta que piden los profesores, con el contenido real del proyecto. **Tienes que revisarlo, personalizarlo (sobre todo conclusiones, reparto de tareas y nombres), añadir las capturas/mockups y pasarlo a Word con su formato** (ver checklist al final). Los `«...»` son huecos que debes rellenar tú.

---

## PORTADA (primera página, sin numeración)

**Proyecto:** Libitum — Plataforma para artistas de calle y música en vivo
**Autores/as:** Irene «Apellidos» y Álvaro Carrión «Apellidos»
**Tutor/a:** «Nombre del tutor/a»
**Ciclo:** Desarrollo de Aplicaciones Web (DAW)
**Fecha de última modificación:** «fecha»

---

## RESUMEN

Libitum es una plataforma web que conecta a los **artistas de calle y de música en vivo** con su público. Permite al artista crear su perfil y publicar sus eventos, y compartirlos mediante un **código QR**; el público descubre eventos, sigue a sus artistas favoritos, se apunta a los eventos (con recordatorios por email) y puede **apoyarles económicamente** a través de plataformas externas (PayPal, Ko-fi, Bizum), sin que Libitum cobre comisión. El objetivo es que la cultura de calle no se quede en un momento puntual, sino que se convierta en una comunidad que sigue y apoya a sus artistas de forma continuada.

## ABSTRACT

Libitum is a web platform that connects **street and live-music artists** with their audience. Artists create a profile, publish their events and share them through a **QR code**; the audience discovers events, follows their favourite artists, signs up for events (with email reminders) and can **support them financially** through external platforms (PayPal, Ko-fi, Bizum), with Libitum charging no commission. The goal is to turn a fleeting street performance into a lasting community that follows and supports its artists over time.

---

# 1. Introducción

> *(Este párrafo introductorio debe ir en inglés, según las normas.)*

**Libitum** is a full-stack web application aimed at **street performers and live-music artists** and the people who enjoy their work. The core problem it solves is the **lost connection** after a street performance: a passer-by enjoys the show and leaves, with no easy way to follow the artist, know where they will play next, or support them beyond the coins of the moment. Libitum bridges that gap with a personal artist page and a **QR code**: the audience scans it, follows the artist, gets notified about upcoming events and can support them directly. Its main value is **giving street culture continuity and a sustainable way for artists to be discovered and supported**, while keeping the platform free of payment commissions.

## 1.1. Presentación y contexto

La idea nace de una observación real: **el arte de calle se disfruta y se olvida**. Un músico toca en una plaza, la gente lo disfruta y se marcha; la relación se pierde y el apoyo se limita a las monedas del momento.

El problema real que resuelve Libitum es ese: **mantener la conexión** entre el artista y su público más allá de la actuación. Con su página personal y su QR, el artista pasa de ser "alguien que vi una vez" a "alguien a quien sigo, cuyos próximos eventos conozco y al que puedo apoyar". Está pensado especialmente para el **artista de calle**, que no tiene una infraestructura digital propia y necesita algo sencillo que funcione desde el móvil.

## 1.2. Objetivos del proyecto

- Permitir a un artista **crear su perfil** y **publicar y gestionar sus eventos** de forma sencilla.
- Ofrecer un **QR** que enlace el mundo físico (la calle) con la plataforma.
- Que el público pueda **descubrir** eventos y artistas, **seguirlos**, **apuntarse** a eventos y **recibir recordatorios**.
- Facilitar el **apoyo económico** al artista por varias vías (enlace de pago, Bizum) sin que la plataforma cobre comisión.
- Construir una aplicación **real y desplegada**, segura y usable desde el móvil (incluso **instalable** como app).

> Objetivos realistas: no se pretende ser una pasarela de pago ni una red social masiva, sino una herramienta útil, funcional y mantenible para un piloto real con artistas.

## 1.3. Gestión del proyecto (métodos de trabajo y herramientas)

- **Trabajo en equipo:** el proyecto lo hemos desarrollado entre dos integrantes («reparto de tareas: por ejemplo, Irene → frontend/diseño y parte de backend; Álvaro → backend/base de datos» — *ajustad esto a la realidad*), simulando un entorno colaborativo real.
- **Control de versiones:** **Git** + **GitHub**, trabajando sobre una rama común (`develop`), con commits frecuentes y revisión del código del compañero.
- **Reglas de codificación comunes:** convenciones de nombres, comentarios en español explicando el código, y estructura por capas tanto en backend como en frontend para mantener consistencia.
- **Organización del tiempo:** «describid aquí cómo repartisteis el tiempo, si usasteis tablero de tareas / issues / reuniones, etc.»
- **Herramientas de desarrollo:** Visual Studio Code, Docker (Laravel Sail) para el entorno local, y los paneles de Railway/Vercel para el despliegue.

## 1.4. Enlace del repositorio del código

- **Repositorio:** https://github.com/patito-prog/Libitum  (rama `develop`)

## 1.5. Enlace a la aplicación en producción

- **Aplicación (frontend):** https://libitum.vercel.app
- **API (backend):** https://libitum-production-be88.up.railway.app

**Credenciales para el profesorado:**
- Usuario administrador: `libitum.project@gmail.com` / contraseña: «la que configurasteis»
- *(Opcional)* podéis crear una cuenta de prueba de artista y otra de espectador y dejarlas aquí.

---

# 2. Tecnologías y arquitecturas empleadas

Libitum tiene una **arquitectura desacoplada**: un **frontend** (SPA en React) y un **backend** (API REST en Laravel) independientes, que se comunican por HTTP con JSON. El frontend se aloja en Vercel, el backend y la base de datos en Railway/Neon.

> *(Insertad aquí un diagrama de arquitectura — podéis exportar el del Informe 0 de la documentación técnica.)*

## 2.1. Guía de estilo

La identidad visual busca un estilo **editorial, vivo y artístico pero profesional**, reconocible por su color corporativo (el teal).

**Paleta de colores:**
| Color | Código | Uso |
|---|---|---|
| Teal (primario) | `#1a7d82` | Color corporativo, botones, acentos |
| Coral/salmón (acento) | `#ff8a5b` | Contrastes, detalles |
| Crema (fondo) | `#f4efe3` | Fondo general |
| Casi negro (texto) | `#16181a` | Texto principal |

**Tipografías:**
- **Syne** — para títulos (carácter, tamaños grandes, efecto "cartel").
- **Inter** — para el cuerpo de texto (legible).

> *(Insertad aquí: capturas de los diseños previos —wireframes/mockups—, el logotipo de la aplicación y capturas de las pantallas principales.)*

## 2.2. Listado y justificación de las herramientas en backend

| Herramienta | Justificación |
|---|---|
| **PHP 8 + Laravel 12** | Framework robusto y maduro; lo usamos como **API REST**. Acelera el desarrollo (ORM, validación, rutas, comandos). |
| **Laravel Sanctum** | Autenticación por **tokens** (Bearer), ideal para un SPA en un dominio distinto al backend (evita problemas de CORS con cookies). |
| **spatie/laravel-permission** | Gestión de **roles y permisos** (admin, artista, espectador) de forma limpia. |
| **Symfony Brevo Mailer + HTTP Client** | Envío de **correos por API HTTP** (verificación, recordatorios, recuperar contraseña), porque el hosting bloquea el SMTP saliente. |
| **PHPUnit** | **Tests** automáticos (47 pruebas) del backend. |

## 2.3. Descripción y justificación de la base de datos

- **Tipo:** base de datos **relacional**, **PostgreSQL** (gestionada en Neon).
- **Por qué relacional:** los datos de Libitum tienen relaciones claras y bien definidas (usuarios, eventos, asistencias, seguimientos, categorías), donde la integridad referencial y las consultas con relaciones son clave. Una base relacional encaja mucho mejor que una NoSQL para este dominio.
- **Por qué PostgreSQL:** es robusta, estándar y Neon ofrece Postgres gestionado con capa gratuita.

**Esquema principal (entidad-relación):**

> *(Insertad aquí el **diagrama entidad-relación** — está en el Informe 1 de la documentación técnica, en Mermaid; podéis exportarlo como imagen.)*

Entidades principales:
- **users** (usuarios; un usuario puede ser espectador, artista o admin).
- **artist_profiles** (1:1 con users; datos del artista: bio, redes, donación, Bizum).
- **events** (eventos creados por un artista; con estado, fecha, duración, precio…).
- **categories** y **statuses** (catálogos).
- Tablas intermedias (N:M): **event_user** (asistencia, con `remind_me`), **follows** (seguimientos), **likes**, **category_event**.

## 2.4. Listado y justificación de las herramientas en frontend

| Herramienta | Justificación |
|---|---|
| **React 19 + Vite** | Librería de interfaz moderna; Vite da un desarrollo ágil y un build optimizado. |
| **React Router 7** | Enrutado de la SPA con **carga diferida** por ruta (mejor rendimiento). |
| **CSS Modules (SCSS)** | Estilos **encapsulados** por componente, sobre un sistema de **tokens** de diseño. |
| **Leaflet + react-leaflet + OpenStreetMap/Nominatim** | **Mapas y búsqueda de direcciones gratis y sin clave de API** (se migró desde Google Maps para no depender de tarjeta). |
| **qrcode.react** | Generación del **QR** del artista en el navegador. |
| **vite-plugin-pwa** | Convierte la web en **PWA instalable** en el móvil. |

## 2.5. Servicios utilizados y proceso de despliegue

| Servicio | Para qué |
|---|---|
| **Vercel** | Aloja el **frontend** (CDN, despliegue automático). |
| **Railway** | Aloja el **backend** y un **servicio de cron** (recordatorios). |
| **Neon** | **Base de datos** PostgreSQL gestionada. |
| **Brevo** | Envío de **correos** por API. |

**Proceso de despliegue (despliegue continuo):**
- El repositorio está conectado a GitHub: al hacer **`git push`** a `develop`, **Railway y Vercel se actualizan solos** en minutos.
- El backend arranca con un **Procfile** que aplica migraciones, siembra los datos imprescindibles, cachea la configuración y arranca el servidor.
- Detalles de producción: región **Europa** (cerca de la base de datos), un **volumen persistente** para que las imágenes subidas no se borren, y todo por **HTTPS**.

> *(Podéis apoyar este apartado con el diagrama de despliegue del Informe 8.)*

---

# 3. Ampliaciones y líneas de mejora

**Autocrítica constructiva** — en qué punto está y cómo evolucionaría como producto real:

**Estado actual:** Libitum es un **MVP sólido, desplegado y funcional**, usable con usuarios reales para un piloto.

**Limitaciones reconocidas:**
- El backend usa el servidor de desarrollo de Laravel (`artisan serve`), que atiende peticiones de una en una. Para mucho tráfico simultáneo habría que pasar a un servidor de producción (php-fpm/Nginx o Laravel Octane).
- El **frontend no tiene tests automáticos** (se ha probado a mano + ESLint); el backend sí (47 tests).
- No hay **monitorización de errores ni backups propios** más allá de los de Neon.
- Al compartir un evento, la imagen de previsualización es la **genérica de marca**, no la portada concreta del evento (requeriría renderizado en servidor).

**Líneas de mejora futuras:**
- Servidor de producción real, monitorización (Sentry) y copias de seguridad.
- Tests de frontend (Vitest + React Testing Library).
- **Notificaciones push** (aprovechando que ya es PWA).
- Imagen de compartir por evento, estadísticas más ricas para el artista y descubrimiento por geolocalización (eventos cercanos).

---

# 4. Conclusiones y comentarios

> *(Este apartado es una reflexión PERSONAL: reescribidlo con vuestras propias palabras y experiencia. Os dejo una base.)*

Con Libitum hemos aplicado de forma conjunta gran parte de lo aprendido en el ciclo: desde el modelado de la base de datos y la construcción de una **API REST** segura, hasta una **interfaz** cuidada y un **despliegue real** en producción. Lo más valioso ha sido **enfrentarnos a un proyecto completo de principio a fin**: tomar decisiones de arquitectura, resolver problemas reales (bloqueos de SMTP, mapas de pago, persistencia de imágenes…) y trabajar en equipo sobre un repositorio común.

También hemos aprendido a **decidir con criterio**: cambiar de tecnología cuando la elegida no encajaba (de SMTP a una API de correo, de Google Maps a OpenStreetMap), priorizando que el proyecto fuera gratuito, mantenible y honesto con sus limitaciones.

«Añadid aquí vuestra reflexión personal: qué os ha costado más, qué habéis disfrutado, qué haríais distinto, cómo os habéis repartido el trabajo, etc.»

---

# 5. Referencias bibliográficas (incluida webgrafía)

> *(Formato pedido para web: [Apellido, Inicial. (fecha). Título de la página. Nombre de la web: URL]. Como la mayoría son documentaciones oficiales, se citan por la organización.)*

- Laravel. (2026). *Laravel 12 Documentation*. Laravel: https://laravel.com/docs
- Laravel. (2026). *Sanctum Documentation*. Laravel: https://laravel.com/docs/sanctum
- Spatie. (2026). *laravel-permission Documentation*. Spatie: https://spatie.be/docs/laravel-permission
- React. (2026). *React Documentation*. Meta: https://react.dev
- Vite. (2026). *Vite Guide*. Vite: https://vite.dev
- React Router. (2026). *React Router Documentation*. Remix: https://reactrouter.com
- Leaflet. (2026). *Leaflet Documentation*. Leaflet: https://leafletjs.com
- OpenStreetMap. (2026). *Nominatim Usage Policy*. OpenStreetMap: https://operations.osmfoundation.org/policies/nominatim/
- Brevo. (2026). *Brevo API Documentation*. Brevo: https://developers.brevo.com
- PostgreSQL. (2026). *PostgreSQL Documentation*. PostgreSQL Global Development Group: https://www.postgresql.org/docs/
- Neon. (2026). *Neon Documentation*. Neon: https://neon.tech/docs
- Railway. (2026). *Railway Documentation*. Railway: https://docs.railway.app
- Vercel. (2026). *Vercel Documentation*. Vercel: https://vercel.com/docs

«Añadid cualquier tutorial, artículo o recurso concreto que hayáis consultado.»

---

# 6. Defensa del proyecto

> *(Guion para la exposición de 25 min + 5 de preguntas. Es un esquema; adaptadlo.)*

1. **Presentación (2-3 min):** qué es Libitum, a quién va dirigido y el problema que resuelve.
2. **Demo en vivo (8-10 min):** registro + verificación de correo, login, crear un evento (con estado automático y donación voluntaria), explorar/seguir artistas, apuntarse a un evento, y lanzar el **batch de recordatorios en directo** (botón "Run now" en Railway) para que llegue el correo. Enseñar el QR y la **instalación como PWA** en el móvil.
3. **Arquitectura y tecnologías (5 min):** el diagrama de arquitectura, la base de datos (E-R), la seguridad (tokens, verificación, roles) y el despliegue.
4. **Decisiones y problemas resueltos (3-4 min):** los cambios de tecnología (SMTP→Brevo, Google Maps→OpenStreetMap) y un par de bugs interesantes.
5. **Monetización y mejoras (2 min):** el enfoque (merch del QR, no cobrar comisión) y las líneas de mejora.
6. **Reparto del trabajo en equipo (1 min).**

> Apoyaos en la **documentación técnica** (los 15 informes de `docs/`) para responder cualquier pregunta del tribunal con seguridad.

---

## ✅ Checklist de formato (al pasar a Word, según las normas de los profes)

- [ ] **Portada** en la primera página, **sin numeración** (título, autores/as, tutor/a, fecha de última modificación).
- [ ] **Resumen** (un párrafo) en **castellano e inglés**, después de la portada y **antes del índice**.
- [ ] **Índice automático** con todos los apartados.
- [ ] Página **A4**, márgenes **≤ 2 cm**, texto **justificado**.
- [ ] Cuerpo en **Arial 10 pt**; interlineado **1,15**; espaciado **0,20 cm** antes/después.
- [ ] Títulos de capítulo en **negrita 12 pt**; apartados/subapartados en **negrita 11 pt**.
- [ ] **Numeración decimal** correlativa de capítulos y apartados.
- [ ] **Números de página** en la esquina inferior derecha.
- [ ] **Figuras/imágenes/tablas numeradas y con título** (pie de imagen).
- [ ] **Introducción** redactada **en inglés** (apartado 1).
- [ ] **Bibliografía** con el formato pedido.
- [ ] Entregar en **un único PDF** por Aules, en plazo.
- [ ] **Añadir las capturas/mockups/logo** (guía de estilo) y el **diagrama E-R** y el de **arquitectura**.
