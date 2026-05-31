import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import PasswordInput from '../../components/common/PasswordInput.jsx';
import API_BASE from '../../config/api.js';
import styles from './Auth.module.scss';

/**
 * Paso 2 del "olvidé mi contraseña": el usuario llega desde el enlace del correo
 * (con token y email en la URL) y elige una contraseña nueva. NO se le pide la
 * antigua (no la sabe); la seguridad la da el token del enlace.
 */
const ResetPassword = () => {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const { save } = useAPI();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [form, setForm] = useState({ password: '', password_confirmation: '' });
    const [loading, setLoading] = useState(false);

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        if (form.password.length < 8) {
            showMessageWithTime('La contraseña debe tener al menos 8 caracteres.', 'error');
            return;
        }
        if (form.password !== form.password_confirmation) {
            showMessageWithTime('Las contraseñas no coinciden.', 'error');
            return;
        }
        setLoading(true);
        try {
            await save(`${API_BASE}/api/reset-password`, {
                token, email,
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            showMessageWithTime('¡Contraseña actualizada! Ya puedes iniciar sesión.', 'ok');
            navigate('/login');
        } catch (err) {
            showMessageWithTime(err?.message || 'No se pudo cambiar la contraseña.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Enlace mal formado (sin token o email).
    if (!token || !email) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1 className={styles.title}>Enlace no válido</h1>
                    <p className={styles.subtitle}>
                        El enlace para restablecer la contraseña no es correcto o está incompleto.
                        Vuelve a solicitarlo.
                    </p>
                    <p className={styles.switchAuth}><Link to="/recuperar-contrasena">Pedir un nuevo enlace</Link></p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Nueva contraseña</h1>
                <p className={styles.subtitle}>Elige una contraseña nueva para <strong>{email}</strong>.</p>

                <form className={styles.form} onSubmit={submit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Nueva contraseña</label>
                        <PasswordInput id="password" name="password" className={styles.input}
                            placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                            value={form.password} onChange={update} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password_confirmation">Repite la contraseña</label>
                        <PasswordInput id="password_confirmation" name="password_confirmation" className={styles.input}
                            placeholder="Repite la nueva contraseña" autoComplete="new-password"
                            value={form.password_confirmation} onChange={update} />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                </form>

                <p className={styles.switchAuth}><Link to="/login">Volver al inicio de sesión</Link></p>
            </div>
        </div>
    );
};

export default ResetPassword;
