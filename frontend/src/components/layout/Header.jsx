import { Link, useNavigate } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js'; 
import styles from './Header.module.scss';

//HEADER DINAMICO PERO DE FORMA PROVISIONAL YA QUE MOLARÍA QUE LAS RUTAS NO ESTÉN TODAS EN LA BARRA DEL HEADER
//(También hay que ponerse de acuerdo de que cosas pueden hacer cada uno de los roles para definir que rutas aparecen).
const Header = () => {
    const { user, logOut } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logOut();
        navigate('/login');
    };

    // Comprobamos el rol de forma segura
    const isSpectator = user?.role === 'user' || user?.role === 'spectator';
    const isArtist = user?.role === 'artist';
    const isAdmin = user?.role === 'admin';

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    Libitum<span>.</span>
                </Link>

                <nav className={styles.nav}>
                    {/* Siempre visible para todos */}
                    <Link to="/feed" className={styles.link}>Descubrir</Link>

                    {/* ENLACES PARA ESPECTADORES */}
                    {isSpectator && (
                        <>
                            <Link to="/favorites" className={styles.link}>Favoritos</Link>
                            
                        </>
                    )}

                    {/* ENLACES PARA ARTISTAS */}
                    {isArtist && (
                        <>
                            <Link to="/events" className={styles.link}>Mis Eventos</Link>
                            <Link to="/my-qr" className={styles.link}>Mi QR</Link>
                        </>
                    )}

                    {/* ENLACE PARA ADMIN */}
                    {isAdmin && (
                        <Link to="/admin" className={styles.adminBadge}>Panel Admin</Link>
                    )}
                </nav>

                <div className={styles.userSection}>
                    {user ? (
                        <>
                            <div className={styles.profileInfo}>
                                <p className={styles.name}>{user.name}</p>
                                <span className={styles.role}>{user.role}</span>
                            </div>
                            <button onClick={handleLogout} className={styles.logoutBtn}>
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        /* Si no hay usuario logueado, mostramos botones de entrar */
                        <div className={styles.authLinks}>
                            <Link to="/login" className={styles.link}>Entrar</Link>
                            <Link to="/register" className={styles.adminBadge}>Registrarse</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
