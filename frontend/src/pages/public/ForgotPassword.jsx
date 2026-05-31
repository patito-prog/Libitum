import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import API_BASE from '../../config/api.js';
import styles from './Auth.module.scss';

/**
 * Paso 1 del "olvidé mi contraseña": el usuario pone su correo y le mandamos
 * el enlace para restablecerla. No revelamos si el correo existe o no.
 */
const ForgotPassword = () => {
    const { save } = useAPI();
    const { showMessageWithTime } = useMessageContext();
    const [email, setEmail]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent]     = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email) { showMessageWithTime('Escribe tu correo.', 'error'); return; }
        setLoading(true);
        try {
            await save(`${API_BASE}/api/forgot-password`, { email });
            setSent(true);
        } catch (err) {
            showMessageWithTime(err?.message || 'No se pudo enviar el correo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1 className={styles.title}>Revisa tu correo ✉️</h1>
                    <p className={styles.subtitle}>
                        Si <strong>{email}</strong> está registrado, te hemos enviado un enlace para
                        restablecer tu contraseña. Mira también en la carpeta de spam.
                    </p>
                    <p className={styles.switchAuth}><Link to="/login">Volver al inicio de sesión</Link></p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={`${styles.title} ${styles.titleCompact}`}>¿Olvidaste tu contraseña?</h1>
                <p className={styles.subtitle}>Escribe tu correo y te enviaremos un enlace para crear una nueva.</p>

                <form className={styles.form} onSubmit={submit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email" id="email" name="email" className={styles.input}
                            placeholder="tu@email.com" autoComplete="username"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <p className={styles.switchAuth}>¿Te acuerdas? <Link to="/login">Inicia sesión</Link></p>
            </div>
        </div>
    );
};

export default ForgotPassword;
