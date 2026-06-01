# Informe 10 — Decisiones de funcionalidad

> Este informe explica las **decisiones sobre lo que hace la app** y los cambios de rumbo que fui tomando: por qué la aplicación funciona como funciona y cómo apliqué cada decisión. No es el "cómo está hecho por dentro" (eso son los informes técnicos), sino **el porqué de las funcionalidades**.

Las agrupo por área.

---

## 1. Acceso y entrada de usuarios

### 1.1. Landing pública en vez de obligar a registrarse
- **Decisión:** un visitante que no tiene cuenta ve una **página de presentación (Landing)** que le invita a registrarse, en lugar de mandarlo directo al login.
- **Por qué:** obligar a iniciar sesión antes de ver nada espanta a la gente. Una carta de presentación convierte mejor.
- **Cómo:** la ruta raíz (`/`) decide: si estás logueado, ves el panel **Home**; si no, la **Landing**.

### 1.2. Verificación de correo obligatoria
- **Decisión:** al registrarse hay que **confirmar el correo** antes de poder entrar.
- **Por qué:** evita cuentas falsas y correos inventados, y asegura que los recordatorios lleguen a buzones reales.
- **Cómo:** al registrar no se da token; se manda un correo con enlace firmado; el login bloquea a los no verificados.

### 1.3. Recuperar contraseña por correo
- **Decisión:** añadir el flujo "olvidé mi contraseña" (cambiarla con un enlace, sin saber la antigua).
- **Por qué:** es básico en cualquier app real; sin esto, quien olvida su clave se queda fuera para siempre.

---

## 2. El modelo de eventos

### 2.1. Estado del evento automático
- **Decisión:** el artista **solo elige borrador o publicado**; que esté "en directo" o "terminado" lo **calcula la app** a partir de la fecha y la duración.
- **Por qué:** pedirle al artista que marque a mano "ahora estoy en directo" es poco realista (está tocando, no mirando el móvil). Mejor que sea automático.
- **Cómo:** un atributo calculado (`effective_status_name`) en el modelo Event (ver Informe 2).

### 2.2. Cancelar y eliminar eventos
- **Decisión:** el artista puede **cancelar** un evento publicado (con un botón) y **eliminar** sus eventos.
- **Por qué:** los planes cambian; necesitaba dar control real sobre sus propios eventos.

### 2.3. Duración del evento
- **Decisión:** añadir un campo de **duración** (de horas a días).
- **Por qué:** es lo que permite calcular cuándo un evento pasa de "en directo" a "terminado".

---

## 3. Monetización pensada para el artista

> El planteamiento completo de pagos está en el Informe 14; aquí solo las **decisiones funcionales**.

### 3.1. Donación voluntaria en vez de "precio 0"
- **Decisión:** además de poner precio, el artista puede marcar el evento como **"donación voluntaria"** (entrada gratis, pasar la gorra).
- **Por qué:** obligar a poner "0 €" no transmite bien que es gratis y que puedes colaborar. "Donación voluntaria" es el modelo natural del artista de calle.

### 3.2. Bizum como alternativa a los enlaces de pago
- **Decisión:** el artista puede poner su **Bizum** (su móvil), no solo un enlace de PayPal/Ko-fi.
- **Por qué:** no todos tienen PayPal o Ko-fi, y esas plataformas cobran comisión. El Bizum es directo y sin comisión (lo más usado en España). Se hace bajo su responsabilidad (el número es público).

### 3.3. Recomendaciones y guía de pagos
- **Decisión:** avisar al artista de qué plataforma le conviene (recomendar **Ko-fi**, avisar de las comisiones de PayPal y del **mínimo de 1 €**) y crear una **guía de pagos** completa.
- **Por qué:** quiero que el artista **gane más**, no solo darle un campo vacío.

---

## 4. Descubrir y socializar

### 4.1. Feed "Para Ti"
- **Decisión:** un feed con los eventos de los artistas que sigues (y un modo de descubrimiento).
- **Por qué:** es el corazón del uso diario: abrir la app y ver qué hay.

### 4.2. Página de explorar artistas
- **Decisión:** añadir una página para **buscar artistas, seguirlos y ver su perfil**.
- **Por qué:** faltaba la pieza para **descubrir gente nueva** y construir la comunidad. Sin ella solo podías seguir a quien ya conocías.

### 4.3. Buscador de eventos público
- **Decisión:** que buscar eventos sea **público** (sin sesión).
- **Por qué:** para que cualquiera pueda descubrir eventos antes de registrarse.

### 4.4. "Cerca de mí" (pensado para turismo)
- **Decisión:** una tercera pestaña en el feed, **"📍 Cerca"**, que muestra los eventos **a tu alrededor** (radio de 30 km) ordenados del más cercano al más lejano, y enseña la distancia en cada tarjeta ("🚶 a 1,2 km").
- **Por qué:** pensando en alguien que está **de turismo** o que acaba de llegar a una ciudad: abre la app, pulsa "Cerca" y ve qué hay sonando alrededor **ahora mismo**, sin tener que buscar por nombre de ciudad. Convierte la app en una herramienta de descubrimiento *in situ*.
- **Cómo:** al pulsar la pestaña, el navegador pide permiso de **ubicación** (`navigator.geolocation`) y manda mi posición a la API. El backend calcula la distancia a cada evento con la **fórmula de Haversine** (la distancia real sobre la esfera terrestre), descarta los que están a más de 30 km o sin coordenadas, y los ordena por cercanía. Los eventos se geocodifican al crearlos (guardan latitud/longitud), así que ya había con qué medir.
- **Detalle honesto:** depende de que el usuario **dé permiso** de ubicación; si lo deniega, se le avisa y sigue usando "Para Ti" con normalidad.

---

## 5. Experiencia móvil y "modo app"

### 5.1. Convertir la web en PWA (instalable)
- **Decisión:** que los usuarios puedan **instalar Libitum** en el móvil como una app.
- **Por qué:** el público es gente en la calle, en eventos, todo desde el móvil. Un icono en la pantalla de inicio que abre a pantalla completa es mucho más cómodo y profesional.

### 5.2. Compartir el evento (no la ubicación)
- **Decisión:** el botón de compartir comparte el **enlace público del evento**, no la ubicación.
- **Por qué:** la página del evento es pública y desde ahí ya se accede al mapa, así que compartir el evento entero tiene más sentido y difunde más.

### 5.3. Mapa del feed no interactivo
- **Decisión:** en el feed, el mini-mapa es **fijo** (no se arrastra ni hace zoom).
- **Por qué:** al hacer scroll en el móvil, tocar el mapa sin querer "secuestraba" el desplazamiento. Mejor que sea solo una vista previa; para llegar, el botón "Cómo llegar".

---

## 6. Administración

- **Decisión:** el admin **no tiene perfil público** que ver/editar (se le quitó del menú).
- **Por qué:** un administrador no es un artista ni un espectador; tener un perfil social no tiene sentido para su rol.

---

## 7. Resumen

Las decisiones de funcionalidad siguen un hilo claro: **pensar en el uso real**.
- Para el **visitante**: que pueda ver y descubrir antes de registrarse (Landing, buscar público).
- Para el **artista**: control real de sus eventos (estado automático, cancelar/eliminar) y cobrar de la forma que más le conviene (donación voluntaria, Bizum, guía de pagos).
- Para el **público**: descubrir (feed, explorar artistas, **eventos cerca** por geolocalización) y usarlo cómodo en el móvil (PWA, compartir, mapa que no estorba).

> Siguiente: **Informe 11 — Diseño y experiencia de usuario**, donde explico las decisiones visuales y de UX (la paleta, la tipografía, los detalles de interacción).
