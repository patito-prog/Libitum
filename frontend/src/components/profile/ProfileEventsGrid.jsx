import { Link } from 'react-router-dom';
import { formatDate, STATUS_LABELS } from '../../utils/validations';
import styles from '../../pages/public/UserProfile.module.scss';

const ProfileEventsGrid = ({ events }) => {
    if (!events?.length) return null;

    return (
        <section className={styles.eventsSection}>
            <h2 className={styles.sectionTitle}>Eventos</h2>
            <div className={styles.eventsGrid}>
                {events.map(event => (
                    <Link key={event.id} to={`/event/${event.id}`} className={styles.eventCard}>
                        {event.cover_image
                            ? <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                            : <div className={styles.eventCoverPlaceholder} />
                        }
                        <div className={styles.eventInfo}>
                            <div className={styles.eventTitleRow}>
                                <p className={styles.eventTitle}>{event.title}</p>
                                {event.status && (
                                    <span className={`${styles.badge} ${styles[event.status.name]}`}>
                                        {STATUS_LABELS[event.status.name] ?? event.status.name}
                                    </span>
                                )}
                            </div>
                            {event.event_date && (
                                <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ProfileEventsGrid;
