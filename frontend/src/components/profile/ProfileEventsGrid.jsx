import { Link } from 'react-router-dom';
import { formatDate, getStatusName } from '../../utils/validations';
import EventStatusBadge from '../common/EventStatusBadge.jsx';
import styles from '../../pages/public/UserProfile.module.scss';

/** Rejilla tipo Instagram con los eventos del perfil. Destaca el que esté en directo. */
const ProfileEventsGrid = ({ events }) => {
    if (!events?.length) return null;

    return (
        <section className={styles.eventsSection}>
            <h2 className={styles.sectionTitle}>Eventos</h2>
            <div className={styles.eventsGrid}>
                {events.map(event => {
                    const isLive = getStatusName(event) === 'live';
                    return (
                        <Link
                            key={event.id}
                            to={`/event/${event.id}`}
                            className={`${styles.eventCard} ${isLive ? styles.eventCardLive : ''}`}
                        >
                            {isLive && <span className={styles.liveCardBadge}>🔴 EN DIRECTO</span>}
                            {event.cover_image
                                ? <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                                : <div className={styles.eventCoverPlaceholder} />
                            }
                            <div className={styles.eventInfo}>
                                <div className={styles.eventTitleRow}>
                                    <p className={styles.eventTitle}>{event.title}</p>
                                    <EventStatusBadge event={event} />
                                </div>
                                {event.event_date && (
                                    <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default ProfileEventsGrid;
