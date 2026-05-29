import LoadingDots from './LoadingDots.jsx';
import styles from './Loading.module.scss';

/**
 * Pantalla/estado de carga reutilizable. Sustituye a los "Cargando..." sueltos
 * que había repartidos sin estilo por toda la app.
 *
 * Props:
 *  - message: texto bajo los puntitos (por defecto "Cargando").
 *  - fullScreen: si true, ocupa toda la pantalla y centra (para guards de ruta
 *    y carga inicial de páginas). Si false, es un bloque inline más discreto.
 */
const Loading = ({ message = 'Cargando', fullScreen = false }) => (
    <div className={fullScreen ? styles.fullScreen : styles.inline}>
        <LoadingDots />
        {message && <p className={styles.message}>{message}</p>}
    </div>
);

export default Loading;
