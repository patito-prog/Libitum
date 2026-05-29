import styles from './Container.module.scss';

/** Contenedor raíz en columna a pantalla completa (header + contenido + footer). */
const Container = ({ children }) => (
    <div className={styles.container}>{children}</div>
);

export default Container;
