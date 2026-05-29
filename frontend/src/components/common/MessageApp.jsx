import React from "react";
import useMessageContext from "../../hooks/useMessageContext.js";
import styles from "./MessageApp.module.scss";

// Icono según el tipo de mensaje.
const ICONS = {
    ok:    "✓",
    error: "✕",
    info:  "ℹ",
};

/**
 * Toast global. Se cuelga del MessageContext y se pinta solo cuando hay un
 * mensaje activo, con su color/icono según el tipo y una barra de progreso.
 */
const MensajeApp = () => {
    const { message, messageType, activeMessage } = useMessageContext();
    const type = messageType?.toLowerCase();

    return (
        activeMessage && (
            <div className={`${styles.container} ${styles[type] ?? ''}`}>
                <span className={styles.icon}>{ICONS[type] ?? "ℹ"}</span>
                <p>{message}</p>
            </div>
        )
    );
};

export default MensajeApp;
