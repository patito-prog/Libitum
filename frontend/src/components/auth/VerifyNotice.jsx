import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import styles from './VerifyNotice.module.scss';

/**
 * Aviso de "revisa tu correo para confirmar tu cuenta". Se muestra tras
 * registrarse y también al intentar entrar con una cuenta sin verificar.
 * Incluye botón para reenviar el correo (con throttle en el back).
 *
 * @param {{ email: string, title?: string }} props
 */
const VerifyNotice = ({ email, title = 'Revisa tu correo' }) => {
    const { resendVerification } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const [sending, setSending] = useState(false);

    const resend = async () => {
        try {
            setSending(true);
            await resendVerification(email);
            showMessageWithTime('Te hemos reenviado el correo de confirmación.', 'ok');
        } catch {
            showMessageWithTime('No hemos podido reenviar el correo. Inténtalo en un minuto.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.notice}>
            <span className={styles.icon} aria-hidden="true">✉️</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.text}>
                Te hemos enviado un enlace de confirmación
                {email ? <> a <strong>{email}</strong></> : null}. Pincha en él para
                activar tu cuenta y poder entrar.
            </p>
            <p className={styles.hint}>
                ¿No lo ves? Mira en la carpeta de <strong>spam</strong> o promociones.
            </p>

            <button type="button" className={styles.resendBtn} onClick={resend} disabled={sending}>
                {sending ? 'Reenviando...' : 'Reenviar correo'}
            </button>

            <p className={styles.back}>
                <Link to="/login">Volver al inicio de sesión</Link>
            </p>
        </div>
    );
};

export default VerifyNotice;
