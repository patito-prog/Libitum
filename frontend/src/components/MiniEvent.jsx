import styles from './MiniEvent.module.scss';
import appStyles from '../App.module.scss';
import EventStatusBadge from './common/EventStatusBadge.jsx';
import useEventContext from "../hooks/useEventContext.js";
import { mapsUrl } from '../config/googleMaps.js';

/** Descompone la fecha ISO en día / mes corto / hora para el resguardo. */
const splitDate = (iso) => {
    if (!iso) return { day: '--', month: '', time: '' };
    const d = new Date(iso);
    return {
        day:   String(d.getDate()).padStart(2, '0'),
        month: d.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
        time:  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
};

/**
 * Tarjeta de evento compacta con forma de entrada de concierto (stub de fecha
 * a la izquierda + cuerpo). Se usa en listados: búsqueda, favoritos, perfiles.
 *
 * @param {Object}   props
 * @param {Object}   props.data    Datos del evento
 * @param {Function} [props.onClick] Acción al pulsar la tarjeta (normalmente ir al detalle)
 * @param {Function} [props.onLike]  Handler del like (si no, usa el del contexto)
 */
const MiniEvent = ({ data, onClick, onLike }) => {
    const { id, title, location, event_date, liked, latitude, longitude, artist } = data;
    const { day, month, time } = splitDate(event_date);

    const { toggleLike } = useEventContext();

    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (onLike) onLike(id);
        else toggleLike(id);
    };

    return (
        <div id={id} className={`${styles.card} ${appStyles.cristal}`} onClick={onClick}>

            {/* ── Resguardo (stub) con la fecha ── */}
            <div className={styles.stub}>
                <span className={styles.stubDay}>{day}</span>
                <span className={styles.stubMonth}>{month}</span>
                <span className={styles.stubTime}>{time}</span>
            </div>

            {/* Perforación troquelada entre stub y cuerpo */}
            <div className={styles.perforation} aria-hidden="true" />

            {/* ── Cuerpo del ticket ── */}
            <div className={styles.body}>
                <div className={styles.bodyTop}>
                    {artist && <span className={styles.artist}>{artist.name}</span>}
                    <button
                        className={styles.likeBtn}
                        onClick={handleLikeClick}
                        title={liked ? 'Quitar me gusta' : 'Me gusta'}
                    >
                        {liked ? '❤️' : '🤍'}
                    </button>
                </div>

                <h3 className={styles.title}>{title}</h3>

                <div className={styles.locationRow}>
                    <span className={styles.location}>📍 {location}</span>
                    {location && (
                        <a
                            href={mapsUrl(latitude, longitude, location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapsBtn}
                            onClick={e => e.stopPropagation()}
                            title="Cómo llegar"
                        >
                            Cómo llegar ↗
                        </a>
                    )}
                </div>

                <div className={styles.footer}>
                    <EventStatusBadge event={data} />
                </div>
            </div>
        </div>
    );
};

export default MiniEvent;
