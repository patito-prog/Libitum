import { Link, useLocation } from 'react-router-dom';
import styles from './Footer.module.scss';

// El feed es una experiencia a pantalla completa (tipo app): sin footer.
const HIDE_ON = ['/feed'];

const Footer = () => {
    const { pathname } = useLocation();
    if (HIDE_ON.includes(pathname)) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.brandBlock}>
                    <span className={styles.brand}>LIBITUM<span>✦</span></span>
                    <span className={styles.tagline}>Música en vivo · Arte callejero</span>
                </div>

                <nav className={styles.nav}>
                    <Link to="/about" className={styles.navLink}>Sobre nosotros</Link>
                    <Link to="/pagos" className={styles.navLink}>Guía de pagos</Link>
                    <Link to="/contact" className={styles.navLink}>Contacto</Link>
                    <Link to="/privacidad" className={styles.navLink}>Privacidad</Link>
                    <Link to="/terminos" className={styles.navLink}>Términos</Link>
                    {/* Destello: apoyar el proyecto (lleva a la sección de Contacto) */}
                    <Link to="/contact" className={styles.support}>
                        <span className={styles.spark} aria-hidden="true">✨</span>
                        Apoya el proyecto
                    </Link>
                </nav>

                <small className={styles.copy}>
                    © {new Date().getFullYear()} · Hecho para los que tocan en la calle
                </small>
            </div>
        </footer>
    );
};

export default Footer;
