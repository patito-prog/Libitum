import { formatDate } from '../../utils/validations';
import styles from '../../pages/public/ArtistProfile.module.scss';

const ArtistEventsSection = ({ events }) => (
    <section className={styles.eventsSection}>
        <h2>Próximos eventos</h2>
        {events?.length > 0 ? (
            <div className={styles.eventsGrid}>
                {events.map(event => (
                    <div key={event.id} className={styles.eventCard}>
                        {event.cover_image && (
                            <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                        )}
                        <div className={styles.eventBody}>
                            <div className={styles.eventHeader}>
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                {event.status && (
                                    <span className={`${styles.badge} ${styles[event.status.name]}`}>
                                        {event.status.name}
                                    </span>
                                )}
                            </div>
                            {event.event_date && <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>}
                            {event.location  && <p className={styles.eventMeta}>📍 {event.location}</p>}
                            <p className={styles.eventPrice}>
                                {Number(event.price) > 0
                                    ? `💶 ${Number(event.price).toFixed(2)} €`
                                    : 'Entrada gratuita'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className={styles.noEvents}>Este artista no tiene eventos publicados por ahora.</p>
        )}
    </section>
);

export default ArtistEventsSection;
