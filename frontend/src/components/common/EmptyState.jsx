import styles from './EmptyState.module.scss';

/**
 * Estado vacío reutilizable (cuando no hay resultados, favoritos, etc.).
 * Centra un icono opcional, un mensaje y una pista opcional.
 *
 * @param {Object} props
 * @param {string} props.message Mensaje principal
 * @param {string} [props.hint]  Sugerencia secundaria (ej. "Busca en...")
 * @param {string} [props.icon]  Emoji/icono decorativo
 */
const EmptyState = ({ message, hint, icon }) => (
    <div className={styles.empty}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <p className={styles.message}>{message}</p>
        {hint && <p className={styles.hint}>{hint}</p>}
    </div>
);

export default EmptyState;
