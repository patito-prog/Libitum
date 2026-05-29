import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext.js';
import { ROLE_LABELS } from '../../utils/validations';
import styles from './Header.module.scss';

/**
 * Cabecera/navegación de la app.
 *
 * Muestra unos enlaces u otros según el rol (espectador, artista, admin) y la
 * sesión. En escritorio tiene un desplegable "Más" para el artista; en móvil
 * colapsa en un menú hamburguesa. Ambos se cierran al hacer click fuera.
 */
const Header = () => {
    const { user, logOut } = useAuthContext();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleLogout = () => {
        logOut();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const isSpectator = user?.role === 'user' || user?.role === 'spectator';
    const isArtist = user?.role === 'artist';
    const isAdmin = user?.role === 'admin';

    const navLinkClass = ({ isActive }) =>
        isActive ? `${styles.link} ${styles.active}` : styles.link;

    const mobileLinkClass = ({ isActive }) =>
        isActive ? `${styles.mobileLink} ${styles.active}` : styles.mobileLink;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (
                mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
                hamburgerRef.current && !hamburgerRef.current.contains(e.target)
            ) {
                setMobileMenuOpen(false);
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

            {/* Nav escritorio */}
            <nav className={styles.nav}>
                {user && (
                    <NavLink to="/feed" className={navLinkClass}>Para Ti</NavLink>
                )}
                {(isSpectator || isArtist) && (
                    <NavLink to="/favorites" className={navLinkClass}>Favoritos</NavLink>
                )}
                {isSpectator && (
                    <NavLink to="/asistencias" className={navLinkClass}>Asistencias</NavLink>
                )}
                {isArtist && (
                    <NavLink to="/events" className={navLinkClass} end>Mis Eventos</NavLink>
                )}
                {isAdmin && (
                    <NavLink to="/admin" className={({ isActive }) =>
                        isActive ? `${styles.adminBadge} ${styles.active}` : styles.adminBadge
                    }>
                        Panel Admin
                    </NavLink>
                )}
                <NavLink to="/events/buscar" className={navLinkClass} >Buscar</NavLink>
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
                                <Link to={`/user/${user?.id}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    Mi perfil
                                </Link>
                                <Link to="/estadisticas" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    Estadísticas
                                </Link>
                                <Link to="/my-qr" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    Mi QR
                                </Link>
                                <Link to={`/artist/${user?.id}`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    Mi página de artista
                                </Link>
                                <Link to="/asistencias" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                    Mis asistencias
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* Sección derecha escritorio */}
            <div className={styles.userSection}>
                {user ? (
                    <>
                        {/* El admin no tiene perfil público que ver/editar: mostramos
                            su nombre como texto, sin enlace. El resto sí enlaza. */}
                        {isAdmin ? (
                            <div className={styles.profileLink}>
                                <div className={styles.profileInfo}>
                                    <p className={styles.name}>{user.name}</p>
                                    <span className={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</span>
                                </div>
                            </div>
                        ) : (
                            <Link to={`/user/${user.id}`} className={styles.profileLink}>
                                <div className={styles.profileInfo}>
                                    <p className={styles.name}>{user.name}</p>
                                    <span className={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</span>
                                </div>
                            </Link>
                        )}
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

            {/* Botón hamburguesa (solo móvil) */}
            <button
                ref={hamburgerRef}
                className={styles.hamburger}
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Abrir menú"
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Menú móvil desplegable */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenu} ref={mobileMenuRef}>
                    {user && (
                        <NavLink to="/feed" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>Para Ti</NavLink>
                    )}
                    <NavLink to="/events/buscar" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>Buscar</NavLink>
                    {(isSpectator || isArtist) && (
                        <NavLink to="/favorites" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>Favoritos</NavLink>
                    )}
                    {(isSpectator || isArtist) && (
                        <NavLink to="/asistencias" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>Mis asistencias</NavLink>
                    )}
                    {isArtist && (
                        <NavLink to="/events" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)} end>Mis Eventos</NavLink>
                    )}
                    {isArtist && (
                        <>
                            <Link to={`/artist/${user?.id}`} className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Mi página de artista</Link>
                            <Link to="/my-qr" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Mi QR</Link>
                            <Link to="/estadisticas" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Estadísticas</Link>
                        </>
                    )}
                    {isAdmin && (
                        <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMobileMenuOpen(false)}>Panel Admin</NavLink>
                    )}
                    {/* El admin no tiene perfil público: no le mostramos "Mi perfil". */}
                    {user && !isAdmin && (
                        <Link to={`/user/${user.id}`} className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                            Mi perfil
                        </Link>
                    )}
                    {user && (
                        <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                            Cerrar sesión
                        </button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
