import styles from './LoadingDots.module.scss';

/**
 * Tres puntitos animados de "cargando". Lo usamos en el scroll infinito del
 * feed y la búsqueda mientras se piden más resultados.
 */
const LoadingDots = () => (
    <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
    </div>
);

export default LoadingDots;
