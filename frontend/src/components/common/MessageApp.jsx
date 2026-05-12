import React from "react";
import useMessageContext from "../../hooks/useMessageContext.js";
import styles from "./MessageApp.module.scss";

const ICONS = {
    ok:    "✓",
    error: "✕",
    info:  "ℹ",
};

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
