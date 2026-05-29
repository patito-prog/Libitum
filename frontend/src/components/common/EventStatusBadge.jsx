import { getStatusName, STATUS_LABELS } from '../../utils/validations';
import styles from './EventStatusBadge.module.scss';

/**
 * Etiqueta de estado de un evento (Publicado, En directo, Terminado...).
 *
 * Usa `getStatusName`, que devuelve el estado EFECTIVO (calculado por fecha),
 * no el guardado en BD: así un evento "publicado" cuya fecha ya pasó se pinta
 * como "Terminado" sin tener que tocar la base de datos.
 *
 * @param {Object} props
 * @param {Object} props.event Evento del que sacar el estado
 */
const EventStatusBadge = ({ event }) => {
    const name = getStatusName(event);
    if (!name) return null;
    return (
        <span className={`${styles.badge} ${styles[name] ?? ''}`}>
            {STATUS_LABELS[name] ?? name}
        </span>
    );
};

export default EventStatusBadge;
