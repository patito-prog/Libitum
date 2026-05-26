import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext.js';
import styles from './Header.module.scss';

const Header = () => {
    const { user, logOut } = useAuthContext();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logOut();
        navigate('/login');
    };

    const isSpectator = user?.role === 'user' || user?.role === 'spectator';
    const isArtist = user?.role === 'artist';
    const isAdmin = user?.role === 'admin';

    const navLinkClass = ({ isActive }) =>
        isActive ? `${styles.link} ${styles.active}` : styles.link;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                Libitum<span>.</span>
            </Link>

            <nav className={styles.nav}>
                {user && (
                    <NavLink to="/feed" className={navLinkClass}>Para Ti</NavLink>
                )}

                {(isSpectator || isArtist) && (
                    <NavLink to="/favorites" className={navLinkClass}>Favoritos</NavLink>
                )}

                {isArtist && (
                    <NavLink to="/events" className={navLinkClass}>Mis Eventos</NavLink>
                )}

                {isAdmin && (
                    <NavLink to="/admin" className={({ isActive }) =>
                        isActive ? `${styles.adminBadge} ${styles.active}` : styles.adminBadge
                    }>
                        Panel Admin
                    </NavLink>
                )}

                {isArtist && (
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={styles.dropdownTrigger}
                            onClick={() => setDropdownOpen(o => !o)}
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            Más <span className={dropdownOpen ? `${styles.chevron} ${styles.chevronUp}` : styles.chevron}>▾</span>
                        </button>

                        {dropdownOpen && (
                            <div className={styles.dropdownMenu} role="menu">
                                <Link
                                    to={`/artist/${user?.id}`}
                                    className={styles.dropdownItem}
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Mi perfil público
                                </Link>
                                <Link
                                    to="/my-qr"
                                    className={styles.dropdownItem}
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Mi QR
                                </Link>
                            </div>
                        )}
                    </div>
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
                    <div className={styles.authLinks}>
                        <Link to="/login" className={styles.link}>Entrar</Link>
                        <Link to="/register" className={styles.registerBtn}>Registrarse</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
