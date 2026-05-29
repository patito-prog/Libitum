import styles from './Content.module.scss';

/** Zona de contenido principal (<main>); ocupa el espacio entre header y footer. */
const Content = ({ children }) => (
    <main className={styles.content}>{children}</main>
);

export default Content;
