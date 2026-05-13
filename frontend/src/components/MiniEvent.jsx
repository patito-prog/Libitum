import styles from './MiniEvent.module.scss';
import appStyles from '../App.module.scss';
import { formatDate } from '../utils/validations';

const MiniEvent = ({ data, onClick }) => {
    const { id, title, location, event_date, status } = data;
    const statusName = status?.name ?? '';

    return (
        <div id={id} className={`${styles.card} ${appStyles.cristal}`} onClick={onClick}>
            <p className={styles.title}>{title}</p>
            <p className={styles.location}>📍 {location}</p>
            <div className={styles.footer}>
                <span className={styles.date}>🗓 {formatDate(event_date)}</span>
                <span className={`${styles.badge} ${styles[statusName]}`}>{statusName}</span>
            </div>
        </div>
    );
};

export default MiniEvent;
