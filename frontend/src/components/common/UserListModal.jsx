import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserListModal.module.scss';

/**
 * Modal con una lista de usuarios (seguidores / siguiendo). Al pulsar uno,
 * navega a su perfil y cierra el modal.
 */
const UserListModal = ({ title, users, loading, onClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleUserClick = (userId) => {
        onClose();
        navigate(`/user/${userId}`);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                <div className={styles.list}>
                    {loading ? (
                        <p className={styles.state}>Cargando...</p>
                    ) : users.length === 0 ? (
                        <p className={styles.state}>Nadie aquí todavía.</p>
                    ) : (
                        users.map((u) => (
                            <button key={u.id} className={styles.userRow} onClick={() => handleUserClick(u.id)}>
                                <div className={styles.userAvatar}>
                                    {u.avatar_url
                                        ? <img src={u.avatar_url} alt={u.name} />
                                        : <span>{u.name?.charAt(0).toUpperCase()}</span>
                                    }
                                </div>
                                <div className={styles.userInfo}>
                                    <p className={styles.userName}>{u.name}</p>
                                    {u.city && <p className={styles.userCity}>📍 {u.city}</p>}
                                </div>
                                <span className={`${styles.roleIcon} ${styles[u.role]}`}>
                                    {u.role === 'artist' ? '🎸' : '🎧'}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
