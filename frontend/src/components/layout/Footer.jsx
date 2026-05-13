import styles from './Footer.module.scss';

const Footer = () => (
    <footer className={styles.footer}>
        <small>© {new Date().getFullYear()} Libitum. Todos los derechos reservados.</small>
    </footer>
);

export default Footer;
