# Informe 9 — Problemas encontrados y soluciones

> Este informe recoge los **problemas reales** que surgieron durante el desarrollo y el despliegue, y **cómo los resolví**. Incluye un par de **cambios de tecnología** que tomé por buen criterio. Es la parte que demuestra que entiendo el proyecto de verdad: no solo qué hace, sino **por qué algunas cosas son como son**.

Los agrupo en cuatro bloques: cambios de tecnología, problemas de PostgreSQL, problemas de despliegue/producción y bugs de lógica.

---

## 1. Cambios de tecnología (decisiones de criterio)

### 1.1. De SMTP (Gmail) a Brevo (API)
- **Síntoma:** al enviar correos en producción, la petición se quedaba colgada **30 segundos** y fallaba (`Connection timeout`).
- **Causa:** **Railway bloquea las conexiones SMTP salientes** (puertos 465/587), una protección anti-spam típica de los hostings. Gmail por SMTP era imposible.
- **Solución:** cambiar a **Brevo enviando por su API HTTP** (puerto 443, que nunca se bloquea). Implementé el transporte con `symfony/brevo-mailer`.
- **Lección:** en un PaaS, mejor enviar correos por **API HTTP** que por SMTP.

### 1.2. De Google Maps a OpenStreetMap
- **Síntoma:** el mapa daba **403 Forbidden** y el buscador de direcciones no funcionaba.
- **Causa:** la nueva **Places API de Google exige facturación** (tarjeta), aunque sea con capa gratis.
- **Solución:** migrar a **OpenStreetMap** con **Leaflet** (mapas) y **Nominatim** (búsqueda de direcciones): **gratis, sin clave de API y sin tarjeta**. El "Cómo llegar" sigue abriendo Google Maps con un enlace normal (eso no necesita clave).
- **Lección:** se puede tener mapas profesionales **sin coste ni dependencia de pago**.

---

## 2. Problemas específicos de PostgreSQL

### 2.1. El operador `?` chocaba con los parámetros de la consulta
- **Síntoma:** error 500 al cargar el feed.
- **Causa:** PostgreSQL usa `?` como **operador JSON**, pero PDO usa `?` como **marcador de parámetro**. En una consulta con `whereRaw` chocaban.
- **Solución:** reescribir la consulta usando aritmética de intervalos (`INTERVAL`) y `NOW()` directamente, evitando el conflicto.

### 2.2. `wherePivot` dentro de `whereHas` generaba SQL roto
- **Síntoma:** el batch de recordatorios no encontraba a los asistentes.
- **Causa:** dentro de `whereHas('attendees', ...)`, el método `wherePivot('remind_me', true)` **no genera bien el SQL** (producía una condición inválida).
- **Solución:** referenciar la columna de la tabla pivote **directamente**: `where('event_user.remind_me', true)`.

### 2.3. La búsqueda de artistas era sensible a mayúsculas
- **Síntoma:** buscar "mozart" no encontraba "Mozart".
- **Causa:** el operador `LIKE` de PostgreSQL **distingue mayúsculas**.
- **Solución:** usar `ILIKE` (la versión insensible de Postgres). Lo blindé con un test.

---

## 3. Problemas de despliegue y producción

### 3.1. Las variables de diseño desaparecían en producción
- **Síntoma:** en producción la web se veía "sin estilos" (todo descolocado), pero en local bien.
- **Causa:** el fichero de **tokens de diseño** (`:root` con los colores y fuentes) era un **CSS Module** (`index.module.scss`) importado solo "por efecto". El build de producción se lo **cargaba por "tree-shaking"** (creía que era código muerto), dejando todas las variables sin definir.
- **Solución:** renombrarlo a **`index.scss`** (hoja global, no CSS Module), que el build nunca elimina.

### 3.2. Las imágenes subidas se borraban
- **Síntoma:** los avatares y portadas aparecían rotos al cabo de un rato.
- **Causa:** el disco de Railway es **efímero**: se borra en cada despliegue/reinicio.
- **Solución:** montar un **volumen persistente** en `storage/app/public` para que los ficheros sobrevivan.

### 3.3. La base de datos no conectaba (caía en SQLite)
- **Síntoma:** en producción, error de conexión a una base SQLite que no existe.
- **Causa:** Laravel 12 lee la variable **`DB_URL`**, no `DATABASE_URL` (que era la que había puesto). Sin ella, caía en la conexión por defecto (sqlite).
- **Solución:** usar el nombre correcto, `DB_URL`, con la cadena de Neon.

### 3.4. El enlace de verificación no validaba (proxy de Railway)
- **Síntoma:** al pulsar el enlace del correo, salía un error de "firma inválida".
- **Causa:** Railway sirve detrás de un **proxy**; Laravel veía la petición como `http` cuando la URL firmada se generó en `https` → la firma no coincidía.
- **Solución:** **forzar HTTPS** al generar URLs (`URL::forceScheme('https')`) y **confiar en el proxy** (`trustProxies`) en producción.

### 3.5. El cron usaba SQLite en vez de la base real
- **Síntoma:** el batch de recordatorios fallaba con error de SQLite.
- **Causa:** el **servicio del cron** en Railway no tenía las variables de la base de datos → caía en sqlite.
- **Solución:** darle al servicio del cron las **mismas variables** que el backend.

### 3.6. La imagen al compartir no salía
- **Síntoma:** al compartir un enlace, no aparecía la imagen de previsualización.
- **Causa (doble):** primero, las etiquetas apuntaban a `og-image.png` pero el archivo se llamaba `og-image.jpg`; segundo, las plataformas (WhatsApp/Facebook) **cachean** la previsualización.
- **Solución:** corregir las etiquetas al nombre real y forzar el re-escaneo con el debugger de Facebook.

---

## 4. Bugs de lógica

### 4.1. Salía "apuntarme" aunque ya estuvieras inscrito
- **Síntoma:** al ver un evento al que ya iba, salía el botón "apuntarme" y, al pulsarlo, fallaba.
- **Causa:** la ruta de ver el evento es **pública**, y usaba `Auth::id()`, que en una ruta pública es siempre `null` → el flag `signed_up` salía falso.
- **Solución:** resolver al usuario por su **token** aunque la ruta sea pública (`$request->user('sanctum')`). Lo blindé con dos tests.

### 4.2. El recordatorio decía "mañana" siempre
- **Síntoma:** el correo del batch ponía "tu evento es mañana" aunque fuera hoy.
- **Causa:** el texto estaba fijo, pero la ventana de 48h hace que a veces el evento sea **hoy**.
- **Solución:** calcular "**hoy**" o "**mañana**" según la fecha real del evento.

---

## 5. Qué me llevo de todo esto

- Muchos problemas no eran del código, sino del **entorno de producción** (proxy, disco efímero, bloqueo de SMTP, nombres de variables). Aprendí a **diagnosticar mirando los logs**, no a base de prueba y error.
- Tomé **decisiones de cambiar de tecnología** cuando la elegida no encajaba (SMTP→API, Google Maps→OpenStreetMap), priorizando que fuera **gratis, sin fricción y mantenible**.
- Cada bug importante lo **cerré con un test** para que no vuelva.

> Siguiente: **Informe 10 — Decisiones de funcionalidad**, donde explico los cambios de rumbo en lo que hace la app y cómo se aplicaron.
