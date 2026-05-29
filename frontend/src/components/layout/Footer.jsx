import { useLocation } from 'react-router-dom';
import styles from './Footer.module.scss';

// El feed es una experiencia a pantalla completa (tipo app): sin footer.
const HIDE_ON = ['/feed'];

const Footer = () => {
    const { pathname } = useLocation();
    if (HIDE_ON.includes(pathname)) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <span className={styles.brand}>LIBITUM<span>✦</span></span>
                <span className={styles.tagline}>Música en vivo · Arte callejero</span>
                <small className={styles.copy}>
                    © {new Date().getFullYear()} · Hecho para los que tocan en la calle
                </small>
            </div>
        </footer>
    );
};

export default Footer;
