import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import styles from './Event.module.scss';
import appStyles from '../App.module.scss';
import { formatDate } from '../utils/validations';

const LIBRARIES = ['places'];
const MAP_OPTIONS = { disableDefaultUI: true, zoomControl: true };

const Event = ({ data, onBack }) => {
    const { id, title, description, location, event_date, price, cover_image, max_capacity, status, latitude, longitude } = data;
    const statusName = status?.name ?? '';
    const coords = latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null;

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
        libraries: LIBRARIES,
        language: 'es',
    });

    return (
        <div id={id} className={`${styles.card} ${appStyles.cristal}`}>

            {cover_image && (
                <img src={cover_image} alt={title} className={styles.cover} />
            )}

            <div className={styles.body}>
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>{title}</h2>
                    <span className={`${styles.badge} ${styles[statusName]}`}>{statusName}</span>
                </div>

                {description && <p className={styles.description}>{description}</p>}

                <div className={styles.meta}>
                    {location   && <span>📍 {location}</span>}
                    {event_date && <span>🗓 {formatDate(event_date)}</span>}
                    {price > 0  && <span>💶 {Number(price).toFixed(2)} €</span>}
                    {max_capacity > 0 && <span>👥 {max_capacity} personas</span>}
                </div>

                {coords && isLoaded && (
                    <GoogleMap
                        mapContainerClassName={styles.map}
                        center={coords}
                        zoom={15}
                        options={MAP_OPTIONS}
                    >
                        <Marker position={coords} />
                    </GoogleMap>
                )}
            </div>

            {onBack && (
                <button className={styles.backBtn} onClick={onBack}>
                    ← Volver
                </button>
            )}
        </div>
    );
};

export default Event;
