# Informe 11 — Diseño y experiencia de usuario

> Este informe explica las **decisiones visuales y de interacción**: por qué la app se ve y se usa como se ve. No es código (eso está en el Informe 4), sino el **criterio de diseño** detrás de la interfaz.

---

## 1. La idea de diseño: artístico pero profesional

El objetivo era una interfaz **original y viva**, con "efecto wow", que **no pareciera una web genérica más**, pero **sin perder profesionalidad**. Como Libitum es de arte callejero y música en vivo, el diseño tira de un estilo **editorial**: tipografía grande, bloques de color, alto contraste y un aire de cartel/fanzine.

Un punto clave: que la marca se **reconozca por su color corporativo (el teal)**. Es el hilo que une toda la app.

---

## 2. Sistema de diseño (tokens)

Para que todo sea coherente, defino unas **variables de diseño** en `index.scss` (`:root`). Todos los componentes las usan, así que la identidad es uniforme y cambiar la paleta es tocar **un solo sitio**.

### Paleta
| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | **`#1a7d82`** (teal vivo) | Color corporativo, botones, acentos |
| `--color-accent` | **`#ff8a5b`** (coral/salmón) | Contraste vivo, detalles, donación |
| `--bg-main` | **`#f4efe3`** (crema cálido) | Fondo de toda la app |
| `--text-primary` | **`#16181a`** (casi negro) | Texto principal |

> La combinación **crema + teal + salmón** da ese aire cálido y artístico, lejos del típico "blanco + azul corporativo".

### Tipografía
- **Syne** (display): la fuente de los **títulos**, con carácter, en mayúsculas y tamaños grandes → el "efecto cartel".
- **Inter** (body): la fuente del **texto normal**, muy legible.

### Forma
- **Radios** definidos (8 / 12 / 18 / 24 px y "pill" para botones redondeados) → esquinas suaves y consistentes.
- Sombras suaves y bordes definidos según el elemento.

---

## 3. Decisiones de experiencia de usuario (UX)

Más allá de lo visual, cuidé los **detalles de interacción** que hacen que se sienta pulida:

| Detalle | Decisión | Por qué |
|---|---|---|
| **Botón "Volver" siempre visible** | Con variante clara para fondos oscuros | Que el usuario nunca se sienta "atrapado" en una pantalla |
| **Mensajes (toasts)** | Avisos flotantes con color/icono según el tipo, animación de entrada/salida y barra de progreso, 5 s | Feedback claro de qué ha pasado, sin cortar la navegación |
| **Errores en español** | Nunca mensajes técnicos ("HTTP 500"); siempre texto claro | Que cualquiera entienda qué falló |
| **Estados de carga** | Loaders y "esqueletos" mientras llegan los datos | Que no parezca que la app se ha colgado |
| **Actualización optimista** | Likes, seguir, apuntarse cambian al instante y se revierten si fallan | Sensación de rapidez |
| **Título que se adapta** | Si el título del evento es muy largo, **encoge la letra** en vez de partirse feo | Que siempre se lea bien |
| **Ojo en las contraseñas** | Botón para mostrar/ocultar lo escrito | Comodidad al teclear |
| **Mapa del feed no interactivo** | Vista previa fija que no estorba el scroll | Mejor experiencia en móvil |
| **Red de seguridad (ErrorBoundary)** | Si algo revienta, aviso amable con botón de recargar | Nunca una pantalla en blanco |

---

## 4. Responsive y "mobile-first"

El público usa el móvil, así que **todo está pensado para que funcione bien en pantallas pequeñas**:
- Uso `dvh` (altura real del visor) para que no se corten cosas con la barra del navegador móvil.
- Tamaños fluidos con `clamp()` (las fuentes y espacios se adaptan al ancho).
- Campos que se **apilan** en móvil para que no se solapen (ej. duración y visibilidad del evento).
- El menú colapsa en un **desplegable** anclado a la derecha.
- Y, como remate, la app es **instalable (PWA)** y se abre a pantalla completa como una app nativa.

---

## 5. Consistencia y mantenibilidad

- **CSS Modules**: cada componente tiene sus estilos encapsulados (no chocan con los de otros).
- **Tokens de diseño**: todos beben de las mismas variables, así que la identidad es coherente en toda la app y los cambios globales son fáciles.
- Componentes reutilizables para los patrones repetidos (botones, tarjetas, loaders, modales de confirmación…), en vez de copiar y pegar.

---

## 6. Accesibilidad (lo básico bien hecho)

- Textos alternativos en imágenes, etiquetas en los formularios, y atributos `aria-*` donde aporta.
- Respeto a `prefers-reduced-motion`: si el usuario tiene desactivadas las animaciones, se reducen.
- Contraste cuidado entre texto y fondo para que se lea bien.

---

## 7. Resumen

- Diseño **editorial, vivo y reconocible** por su **teal corporativo**, con crema + salmón y tipografía Syne/Inter.
- Un **sistema de tokens** que mantiene todo coherente y fácil de cambiar.
- Muchos **detalles de UX** (toasts, loaders, errores en español, optimismo, título adaptable, ojo de contraseña…) que hacen que se sienta una app cuidada.
- **Mobile-first** de verdad, hasta el punto de ser **instalable**.

> Siguiente: **Informe 12 — Situación real y mejoras previstas**, donde explico en qué punto está la app de verdad y la hoja de ruta.
