import { useEffect, useRef, useState } from "react";
import useMessageContext from "../../hooks/useMessageContext.js";
import styles from "./MessageApp.module.scss";

// Icono según el tipo de mensaje.
const ICONS = {
    ok:      "✓",
    error:   "✕",
    warning: "!",
    info:    "ℹ",
};

/**
 * Toast global. Se cuelga del MessageContext y se pinta cuando hay un mensaje
 * activo, con su color/icono según el tipo, animación fluida de entrada y
 * salida, y una barra de progreso que indica cuánto le queda en pantalla.
 *
 * Para que la animación de SALIDA se vea, "congelamos" el texto y el tipo en
 * estado local: así el toast sigue montado mientras se desvanece, aunque el
 * contexto ya haya borrado el mensaje.
 */
const MensajeApp = () => {
    const { message, messageType, activeMessage, messageDuration } = useMessageContext();

    const [render, setRender]   = useState(false);   // ¿está montado en el DOM?
    const [visible, setVisible] = useState(false);   // ¿clase de visible (animación)?
    const [frozen, setFrozen]   = useState({ message: "", type: "info" });
    const exitTimer = useRef(null);

    useEffect(() => {
        clearTimeout(exitTimer.current);

        if (activeMessage && message) {
            // Mensaje nuevo: congelamos contenido, montamos y, al siguiente frame,
            // activamos la clase visible para que la transición CSS arranque.
            setFrozen({ message, type: messageType?.toLowerCase() ?? "info" });
            setRender(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            // Se cierra: quitamos la clase visible (anima la salida) y desmontamos
            // cuando termina la transición.
            setVisible(false);
            exitTimer.current = setTimeout(() => setRender(false), 360);
        }

        return () => clearTimeout(exitTimer.current);
    }, [activeMessage, message, messageType]);

    if (!render) return null;

    const type = frozen.type;

    return (
        <div
            className={`${styles.container} ${styles[type] ?? ''} ${visible ? styles.visible : ''}`}
            role="status"
            aria-live="polite"
        >
            <span className={styles.icon}>{ICONS[type] ?? "ℹ"}</span>
            <p>{frozen.message}</p>
            {/* La barra reinicia su animación en cada mensaje gracias al key. */}
            <span
                key={frozen.message}
                className={styles.progress}
                style={{ animationDuration: `${messageDuration}ms` }}
            />
        </div>
    );
};

export default MensajeApp;
