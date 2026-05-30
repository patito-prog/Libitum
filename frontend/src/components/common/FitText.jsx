import { useRef, useLayoutEffect } from 'react';

/**
 * Encoge el tamaño de letra hasta que el texto cabe en `maxLines` líneas, sin
 * bajar de `min`. Pensado para títulos largos: en vez de partirse enseguida, la
 * letra se hace un poco más pequeña (pero sigue siendo tamaño de título).
 *
 * El tamaño de PARTIDA lo coge del CSS (la clase del padre), así respeta el
 * tamaño responsive (clamp) y solo achica cuando el texto no cabe.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Texto a ajustar
 * @param {number} [props.min=1.2]   Tamaño mínimo en rem (no baja de aquí)
 * @param {number} [props.maxLines=2] Líneas permitidas antes de encoger
 * @param {string} [props.className]
 */
const FitText = ({ children, min = 1.2, maxLines = 2, className }) => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const fit = () => {
            // Reseteamos para partir del tamaño que marca el CSS (clamp responsive).
            el.style.fontSize = '';
            let fsPx = parseFloat(getComputedStyle(el).fontSize);
            const minPx = min * 16;
            const lineHeight = () => parseFloat(getComputedStyle(el).lineHeight) || fsPx;

            let guard = 0;
            while (el.scrollHeight > lineHeight() * maxLines + 1 && fsPx > minPx && guard < 60) {
                fsPx -= 1;
                el.style.fontSize = `${fsPx}px`;
                guard++;
            }
        };

        fit();
        // Re-ajustar si cambia el ancho disponible (rotar móvil, redimensionar).
        const ro = new ResizeObserver(fit);
        if (el.parentElement) ro.observe(el.parentElement);
        return () => ro.disconnect();
    }, [children, min, maxLines]);

    return (
        <span ref={ref} className={className} style={{ display: 'block' }}>
            {children}
        </span>
    );
};

export default FitText;
