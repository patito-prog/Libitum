import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.scss';

/**
 * Botón de "Volver" reutilizable.
 *
 * Por defecto vuelve a la página anterior del historial; si le pasas `to`,
 * navega a esa ruta concreta. La flecha se desliza un poco al hover (puro CSS).
 *
 * @param {Object} props
 * @param {string}  [props.to]    Ruta a la que ir. Si no se pasa, hace navigate(-1).
 * @param {boolean} [props.light] Variante clara (blanca) para fondos oscuros.
 */
const BackButton = ({ to, light = false }) => {
    const navigate = useNavigate();
    return (
        <button
            className={`${styles.btn} ${light ? styles.light : ''}`}
            onClick={() => to ? navigate(to) : navigate(-1)}
        >
            <span className={styles.arrow}>←</span>
            <span className={styles.label}>Volver</span>
        </button>
    );
};

export default BackButton;
