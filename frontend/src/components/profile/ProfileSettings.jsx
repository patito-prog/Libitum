import { useState, useRef, useEffect } from 'react';
import useAPI from '../../hooks/useAPI.js';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import PasswordInput from '../common/PasswordInput.jsx';
import API_BASE from '../../config/api.js';
import styles from './ProfileSettings.module.scss';

/**
 * Menú de "Ajustes" del propio perfil. Agrupa en un solo sitio las acciones de
 * la cuenta: editar perfil, cambiar contraseña, cerrar sesión y eliminar cuenta
 * (esta última discreta, abajo y en rojo, con un modal que pide la contraseña).
 *
 * Editar/contraseña abren los formularios de la página (vía onEdit/onSecurity);
 * cerrar sesión y borrar cuenta los resuelve aquí mismo.
 */
const ProfileSettings = ({ onEdit, onSecurity }) => {
    const { deleteData } = useAPI();
    const { logOut } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();

    const [menuOpen, setMenuOpen]       = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [password, setPassword]       = useState('');
    const [loading, setLoading]         = useState(false);
    const menuRef = useRef(null);

    // Cerramos el menú al hacer click fuera.
    useEffect(() => {
        const onClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const handleDelete = async () => {
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
        <div className={styles.settings} ref={menuRef}>
            <button
                className={styles.trigger}
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
            >
                ⚙️ Ajustes
                <span className={menuOpen ? `${styles.chevron} ${styles.up}` : styles.chevron}>▾</span>
            </button>

            {menuOpen && (
                <div className={styles.menu} role="menu">
                    <button className={styles.item} onClick={() => { setMenuOpen(false); onEdit(); }}>
                        ✏️ Editar perfil
                    </button>
                    <button className={styles.item} onClick={() => { setMenuOpen(false); onSecurity(); }}>
                        🔒 Cambiar contraseña
                    </button>
                    <button className={styles.item} onClick={() => { setMenuOpen(false); logOut(); }}>
                        ↪️ Cerrar sesión
                    </button>
                    <div className={styles.divider} />
                    <button
                        className={`${styles.item} ${styles.danger}`}
                        onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                    >
                        🗑️ Eliminar cuenta
                    </button>
                </div>
            )}

            {confirmOpen && (
                <div className={styles.overlay} onClick={() => !loading && setConfirmOpen(false)}>
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
                        <div className={styles.modalActions}>
                            <button className={styles.cancel} onClick={() => setConfirmOpen(false)} disabled={loading}>
                                Cancelar
                            </button>
                            <button className={styles.delete} onClick={handleDelete} disabled={loading}>
                                {loading ? 'Eliminando...' : 'Eliminar definitivamente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;
