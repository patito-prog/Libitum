# Informe 12 — Situación real y mejoras previstas

> Este informe es una **autoevaluación honesta**: en qué punto está Libitum de verdad, qué aguanta, qué limitaciones tiene y cuál es la hoja de ruta. Conocer lo que falta es tan importante como lo que está hecho.

---

## 1. ¿En qué punto está? (resumen honesto)

Libitum está en estado de **MVP sólido / listo para piloto**. Es una aplicación **completa y funcional**, desplegada y usable con usuarios reales:

- ✅ **Funcionalidad completa:** registro con verificación, login, recuperar contraseña, roles, eventos (con estado automático), seguir artistas, feed, búsqueda, asistencias con recordatorios por email, donaciones (enlace/Bizum), panel admin, PWA instalable.
- ✅ **Desplegada de verdad** (Vercel + Railway + Neon + Brevo), por HTTPS.
- ✅ **Con seguridad pensada para datos reales** (tokens, verificación, rate-limit, CORS, RGPD).
- ✅ **Con tests** que protegen el backend.

No es un prototipo de clase "que solo funciona en local": **funciona en internet y se puede recomendar a artistas reales** para un piloto.

---

## 2. ¿Cuánta gente aguanta? (capacidad real)

La clave es distinguir **usuarios totales** de **usuarios a la vez**:

- **Usuarios registrados:** pueden ser **miles** sin problema (es solo espacio en la base de datos).
- **Usuarios simultáneos** (haciendo clic en el mismo momento): **ese es el límite real**, porque el backend usa un servidor de desarrollo (`php artisan serve`) que atiende de una en una.

| Gente usándolo a la vez | Cómo va |
|---|---|
| Hasta ~20-30 simultáneos | Suave |
| ~30-80 simultáneos | Usable, algún pico lento |
| 100+ en el MISMO instante | Se atasca → tocaría servidor de producción |

> El frontend (Vercel) escala "infinito" (es un CDN); el cuello de botella es solo el backend cuando muchos piden datos a la vez. Para el piloto y la presentación, **va sobrado**.

---

## 3. Coste de mantenimiento

- **Vercel, Neon y Brevo:** capa **gratuita** suficiente para empezar.
- **Railway:** el plan **Hobby (~5 €/mes)** da CPU decente, quita el límite de crédito, permite elegir **región Europa** (más rápido) y el **volumen** para que las imágenes persistan.

Con **~5 €/mes** la app se mantiene cómoda para un uso real de piloto.

---

## 4. Limitaciones conocidas (honestidad total)

Para que no me pillen, estas son las cosas a mejorar:

| Limitación | Detalle |
|---|---|
| **Servidor de desarrollo** | `php artisan serve` atiende de una en una; para mucho tráfico simultáneo habría que pasar a php-fpm/Nginx o Laravel Octane |
| **Sin tests de frontend** | El backend está bien cubierto; el frontend se ha probado a mano + ESLint |
| **Sin monitorización ni backups propios** | No hay alertas de errores (Sentry) ni copias de seguridad automáticas más allá de las de Neon |
| **Arranques fríos de la BD** | La capa gratis de Neon "duerme" tras inactividad; la primera carga tras un rato es algo más lenta |
| **Imagen de compartir genérica** | Al compartir, sale la imagen de marca de Libitum, no la portada concreta de cada evento (eso necesitaría renderizado en servidor) |

Ninguna impide el uso real para un piloto; son cosas de **escalar y endurecer**.

---

## 5. Hoja de ruta (mejoras previstas)

### Técnicas (para escalar y robustez)
- **Servidor de producción real** (php-fpm + Nginx o Laravel Octane) en lugar de `artisan serve`.
- **Monitorización de errores** (Sentry) y **backups** de la base de datos.
- **Mantener la BD despierta** (un ping periódico o Neon de pago) para quitar los arranques fríos.
- **Tests de frontend** (Vitest + React Testing Library).

### De producto (nuevas funcionalidades)
- **Imagen de compartir por evento** (su portada al compartir el enlace).
- **Notificaciones push** (aprovechando que ya es PWA) además de los emails.
- **Estadísticas más ricas** para el artista.
- **Mejoras en el descubrimiento** (recomendaciones, eventos cercanos por geolocalización).
- **Moderación / reportes** más completos en el panel admin.

---

## 6. Conclusión honesta

Libitum **no está "verde" ni es un juguete**: es un **producto funcional, desplegado y seguro**, listo para que un grupo de artistas lo use de verdad en eventos reales, por ~5 €/mes.

Lo que le separa de un "SaaS comercial a gran escala" es trabajo de **endurecimiento** (servidor de producción, monitorización, backups, tests de frontend), no de **funcionalidad**. La base está bien hecha y la hoja de ruta es clara.

> Siguiente: **Informe 13 — Monetización**, donde explico el enfoque empresarial del proyecto.
