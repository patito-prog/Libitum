import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';

const Header = () => {
    const { isAuthenticated, logOut } = useAuthContext();

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>Libitum</Link>
            <nav>
                <ul className={styles.nav}>
                    {isAuthenticated && (
                        <li><Link to="/events">Eventos</Link></li>
                    )}
                    {isAuthenticated
                        ? <li><button className={styles.logoutBtn} onClick={logOut}>Cerrar sesión</button></li>
                        : <li><Link to="/login">Iniciar sesión</Link></li>
                    }
                </ul>
            </nav>
        </header>
    );
};

export default Header;
