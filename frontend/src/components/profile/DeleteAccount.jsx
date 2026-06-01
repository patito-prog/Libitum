import { useState } from 'react';
import useAPI from '../../hooks/useAPI.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import PasswordInput from '../common/PasswordInput.jsx';
import API_BASE from '../../config/api.js';
import styles from './DeleteAccount.module.scss';

/**
 * "Zona de peligro": eliminar la cuenta de forma permanente.
 *
 * Por seguridad, el endpoint (DELETE /api/profile) exige la contraseña actual,
 * así que mostramos un modal que la pide y avisa de que la acción es
 * irreversible. Al borrar, se limpia la sesión y se recarga la web.
 */
const DeleteAccount = () => {
    const { deleteData } = useAPI();
    const { showMessageWithTime } = useMessageContext();
    const [open, setOpen]       = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        if (!password) {
            showMessageWithTime('Escribe tu contraseña para confirmar.', 'error');
            return;
        }
        setLoading(true);
        try {
            await deleteData(`${API_BASE}/api/profile`, { password });
            // La cuenta y sus tokens ya están borrados en el servidor: limpiamos
            // la sesión local y recargamos en la página de inicio.
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (err) {
            showMessageWithTime(err?.message || 'No se pudo eliminar la cuenta. Revisa la contraseña.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className={styles.dangerZone}>
            <div className={styles.dangerInfo}>
                <strong>Eliminar cuenta</strong>
                <p>Borra tu cuenta y todos tus datos de forma permanente. Esta acción no se puede deshacer.</p>
            </div>
            <button className={styles.dangerBtn} onClick={() => setOpen(true)}>
                Eliminar cuenta
            </button>

            {open && (
                <div className={styles.overlay} onClick={() => !loading && setOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <h3>¿Eliminar tu cuenta?</h3>
                        <p className={styles.warn}>
                            Esta acción es <strong>permanente</strong>: se borrarán tu perfil y tus datos.
                            Escribe tu contraseña para confirmar.
                        </p>
                        <PasswordInput
                            className={styles.input}
                            name="password"
                            placeholder="Tu contraseña"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className={styles.actions}>
                            <button className={styles.cancel} onClick={() => setOpen(false)} disabled={loading}>
                                Cancelar
                            </button>
                            <button className={styles.delete} onClick={confirm} disabled={loading}>
                                {loading ? 'Eliminando...' : 'Eliminar definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeleteAccount;
