import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/validations';
import EventStatusBadge from '../common/EventStatusBadge.jsx';
import styles from '../../pages/public/ArtistProfile.module.scss';

/** Sección "Próximos eventos" del perfil del artista; cada tarjeta enlaza al detalle. */
const ArtistEventsSection = ({ events }) => (
    <section className={styles.eventsSection}>
        <h2>Próximos eventos</h2>
        {events?.length > 0 ? (
            <div className={styles.eventsGrid}>
                {events.map(event => (
                    <Link key={event.id} to={`/event/${event.id}`} className={styles.eventCard}>
                        {event.cover_image && (
                            <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                        )}
                        <div className={styles.eventBody}>
                            <div className={styles.eventHeader}>
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                <EventStatusBadge event={event} />
                            </div>
                            {event.event_date && <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>}
                            {event.location  && <p className={styles.eventMeta}>📍 {event.location}</p>}
                            <p className={styles.eventPrice}>
                                {Number(event.price) > 0
                                    ? `💶 ${Number(event.price).toFixed(2)} €`
                                    : 'Entrada gratuita'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <p className={styles.noEvents}>Este artista no tiene eventos publicados por ahora.</p>
        )}
    </section>
);

export default ArtistEventsSection;
