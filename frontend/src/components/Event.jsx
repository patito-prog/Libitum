import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLoadScript, GoogleMap, useGoogleMap } from '@react-google-maps/api';
import styles from './Event.module.scss';
import appStyles from '../App.module.scss';
import { formatDate, getStatusName } from '../utils/validations';
import EventStatusBadge from './common/EventStatusBadge.jsx';
import Button from './common/Button.jsx';
import useEventContext from '../hooks/useEventContext.js';
import { MAPS_LIBRARIES, MAPS_OPTIONS, MAPS_KEY, mapsUrl } from '../config/googleMaps.js';

// Estados en los que un espectador puede apuntarse a un evento.
const INSCRIBABLE = ['published', 'live'];

// Mapa del feed: se puede mover y hacer zoom, pero la rueda solo hace zoom con Ctrl
// (gestureHandling 'cooperative') para no romper el scroll vertical del Para Ti.
const MAPS_OPTIONS_FEED = { ...MAPS_OPTIONS, gestureHandling: 'cooperative' };

/**
 * Parte una fecha ISO en día / mes corto / hora para el sello tipo entrada.
 * @param {string} iso Fecha en formato ISO
 * @returns {{day:string, month:string, time:string}|null}
 */
const splitDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return {
        day:   String(d.getDate()).padStart(2, '0'),
        month: d.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
        time:  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
};

/**
 * Marcador del mapa usando la API nueva (AdvancedMarkerElement).
 * No pinta nada en el DOM de React: se engancha al mapa por imperativo dentro
 * del effect, por eso devuelve null. Debe ir dentro de un <GoogleMap>.
 * @param {{position:{lat:number,lng:number}}} props
 */
const AdvancedMarker = ({ position }) => {
    const map = useGoogleMap();

    useEffect(() => {
        if (!map) return;
        const MarkerEl = window.google?.maps?.marker?.AdvancedMarkerElement;
        if (!MarkerEl) return;

        const marker = new MarkerEl({ position, map });
        return () => { marker.map = null; };
    }, [map, position?.lat, position?.lng]);

    return null;
};

/**
 * Tarjeta de evento "grande" (cartel). Se usa en el detalle del evento y, en
 * versión `compact`, en el feed Para Ti.
 *
 * @param {Object}   props
 * @param {Object}   props.data           Datos del evento
 * @param {Function} [props.onBack]       Si se pasa, muestra el botón Volver
 * @param {Function} [props.onLike]       Handler del like (si no, usa el del contexto)
 * @param {Function} [props.onInscribe]   Handler de apuntarse (muestra el botón si se pasa)
 * @param {boolean}  [props.editable=false] Muestra el botón de editar (vista del artista)
 * @param {boolean}  [props.compact=false]  Versión reducida para el feed (mapa pequeño, descripción recortada)
 */
const Event = ({ data, onBack, onLike, onInscribe, editable = false, compact = false }) => {
    const { id, title, description, location, event_date, price, cover_image, max_capacity, latitude, longitude, liked, artist, signed_up } = data;
    const statusName = getStatusName(data);
    const coords = latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null;
    const dateParts = splitDate(event_date);

    const { toggleLike, setEventForEdit } = useEventContext();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: MAPS_KEY,
        libraries: MAPS_LIBRARIES,
        language: 'es',
    });

    const handleLikeClick = () => {
        if (onLike) onLike(id);
        else toggleLike(id);
    };

    return (
        <div id={id} className={`${styles.card} ${appStyles.cristal} ${compact ? styles.compact : ''}`}>

            {/* Cover + botón volver superpuesto. Sin cover, el botón fluye en columna. */}
            {cover_image ? (
                <div className={styles.coverWrapper}>
                    <img src={cover_image} alt={title} className={styles.cover} />
                    {onBack && (
                        <button className={styles.backBtn} onClick={onBack}>
                            <span>←</span><span>Volver</span>
                        </button>
                    )}
                    {dateParts && (
                        <div className={styles.dateStamp}>
                            <span className={styles.stampDay}>{dateParts.day}</span>
                            <span className={styles.stampMonth}>{dateParts.month}</span>
                            <span className={styles.stampTime}>{dateParts.time}</span>
                        </div>
                    )}
                </div>
            ) : (
                onBack && (
                    <button className={`${styles.backBtn} ${styles.backBtnFlow}`} onClick={onBack}>
                        <span>←</span><span>Volver</span>
                    </button>
                )
            )}

            <div className={styles.body}>
                {artist && (
                    <Link to={`/user/${artist.id}`} className={styles.artistLink}>
                        🎸 {artist.name}
                    </Link>
                )}
                <div className={styles.titleRow}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.titleActions}>
                        <button
                            className={styles.likeBtn}
                            onClick={handleLikeClick}
                            title={liked ? 'Quitar me gusta' : 'Me gusta'}
                        >
                            {liked ? '❤️' : '🤍'}
                        </button>
                        <EventStatusBadge event={data} />
                    </div>
                </div>

                {description && (
                    <p className={`${styles.description} ${compact ? styles.descClamp : ''}`}>
                        {description}
                    </p>
                )}

                <div className={styles.meta}>
                    {location && (
                        <a
                            href={mapsUrl(latitude, longitude, location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.locationLink}
                            onClick={e => e.stopPropagation()}
                        >
                            📍 {location}
                        </a>
                    )}
                    {event_date  && <span>🗓 {formatDate(event_date)}</span>}
                    {price > 0   && <span>💶 {Number(price).toFixed(2)} €</span>}
                    {max_capacity > 0 && (
                        <span>
                            👥 {data.attendees_count ?? 0}/{max_capacity} plazas
                            {data.attendees_count >= max_capacity && <strong> · Completo</strong>}
                        </span>
                    )}
                    {!max_capacity && data.attendees_count > 0 && (
                        <span>👥 {data.attendees_count} inscritos</span>
                    )}
                </div>

                {coords && isLoaded && (
                    compact ? (
                        <div className={styles.compactMap}>
                            <GoogleMap
                                mapContainerClassName={styles.map}
                                center={coords}
                                zoom={14}
                                options={MAPS_OPTIONS_FEED}
                            >
                                <AdvancedMarker position={coords} />
                            </GoogleMap>
                            <a
                                href={mapsUrl(latitude, longitude, location)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.mapPill} ${styles.pillLeft}`}
                                onClick={e => e.stopPropagation()}
                            >
                                <span className={styles.pillPin}>📍</span> Cómo llegar
                            </a>
                        </div>
                    ) : (
                        <div className={styles.mapWrapper}>
                            <GoogleMap
                                mapContainerClassName={styles.map}
                                center={coords}
                                zoom={15}
                                options={MAPS_OPTIONS}
                            >
                                <AdvancedMarker position={coords} />
                            </GoogleMap>
                            <a
                                href={mapsUrl(latitude, longitude, location)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mapsBtn}
                            >
                                Abrir en Google Maps ↗
                            </a>
                        </div>
                    )
                )}
            </div>

            {(editable || onInscribe) && (
                <div className={styles.actions}>
                    {editable && (
                        <Button
                            title="Editar evento"
                            img="/editar.png"
                            onClick={() => setEventForEdit(data)}
                        />
                    )}
                    {onInscribe && INSCRIBABLE.includes(statusName) && (
                        <button
                            className={`${styles.inscribeBtn} ${signed_up ? styles.inscribedActive : ''}`}
                            onClick={() => onInscribe(id, signed_up)}
                        >
                            {signed_up ? '✓ Apuntado' : '+ Me apunto'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Event;
