import { useState, useEffect } from 'react';
import styles from './InstallButton.module.scss';

// ¿Es un iPhone/iPad? Safari NO soporta el evento de instalar automático,
// así que ahí mostramos instrucciones manuales en vez del botón nativo.
const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// ¿La app ya está instalada / abierta en modo "app" (pantalla completa)?
// Si es así, no tiene sentido mostrar el botón de instalar.
const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

/**
 * Botón "Instalar app". Aparece SOLO cuando la web se puede instalar y se
 * oculta solo cuando ya está instalada o el navegador no lo soporta.
 *
 * Cómo funciona por dentro:
 *  - El navegador lanza el evento `beforeinstallprompt` cuando la PWA es
 *    instalable. Lo capturamos y lo guardamos (deferredPrompt).
 *  - Al pulsar el botón, llamamos a deferredPrompt.prompt() → sale el diálogo
 *    nativo de "¿Instalar Libitum?".
 *  - En iOS ese evento no existe, así que mostramos un cartelito con los pasos.
 */
const InstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null); // el evento guardado
    const [visible, setVisible]               = useState(false); // ¿mostrar el botón?
    const [showIosHelp, setShowIosHelp]       = useState(false); // ¿mostrar instrucciones iOS?

    useEffect(() => {
        // Si ya está instalada, no mostramos nada.
        if (isStandalone()) return;

        // Android/Chrome/Edge: el navegador nos avisa de que se puede instalar.
        const onBeforeInstall = (e) => {
            e.preventDefault();    // evitamos el mini-aviso por defecto del navegador
            setDeferredPrompt(e);  // lo guardamos para usarlo cuando pulse el botón
            setVisible(true);
        };
        window.addEventListener('beforeinstallprompt', onBeforeInstall);

        // Cuando termina de instalarse, ocultamos el botón.
        const onInstalled = () => { setVisible(false); setDeferredPrompt(null); };
        window.addEventListener('appinstalled', onInstalled);

        // iOS no lanza el evento: mostramos el botón para dar instrucciones.
        if (isIos()) setVisible(true);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const handleClick = async () => {
        if (deferredPrompt) {
            // Android: lanzamos el diálogo nativo y esperamos la decisión.
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setVisible(false);
        } else if (isIos()) {
            // iOS: enseñamos los pasos manuales.
            setShowIosHelp(true);
        }
    };

    if (!visible) return null;

    return (
        <>
            <button className={styles.installBtn} onClick={handleClick} title="Instalar Libitum">
                <span aria-hidden="true">📲</span> Instalar
            </button>

            {showIosHelp && (
                <div className={styles.iosOverlay} onClick={() => setShowIosHelp(false)}>
                    <div className={styles.iosCard} onClick={(e) => e.stopPropagation()}>
                        <h3>Instalar Libitum en tu iPhone</h3>
                        <ol>
                            <li>Pulsa el botón <strong>Compartir</strong> <span aria-hidden="true">⬆️</span> de Safari.</li>
                            <li>Elige <strong>"Añadir a pantalla de inicio"</strong>.</li>
                        </ol>
                        <button className={styles.iosClose} onClick={() => setShowIosHelp(false)}>Entendido</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallButton;
