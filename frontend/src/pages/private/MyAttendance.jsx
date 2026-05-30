import { useState, useEffect } from 'react';
import useAPI from '../../hooks/useAPI.js';
import useEventContext from '../../hooks/useEventContext.js';
import Event from '../../components/Event.jsx';
import MiniEventSkeleton from '../../components/common/MiniEvenSkeleton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import styles from './MyAttendance.module.scss';
import appStyles from '../../App.module.scss';
import { formatDate, getStatusName } from '../../utils/validations';
import EventStatusBadge from '../../components/common/EventStatusBadge.jsx';
import ShareButton from '../../components/common/ShareButton.jsx';
import API_BASE from '../../config/api.js';

const API = `${API_BASE}/api`;

/** día / mes corto para el mini-stub de fecha. */
const splitDate = (iso) => {
    if (!iso) return { day: '--', month: '' };
    const d = new Date(iso);
    return {
        day:   String(d.getDate()).padStart(2, '0'),
        month: d.toLocaleString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
    };
};

/**
 * Tarjeta de una asistencia: stub de fecha + datos + acciones (recordatorio y
 * darse de baja). Al pulsar el cuerpo dispara onExpand (abre el detalle).
 */
const AttendanceCard = ({ event, onRemindToggle, onLeave, onExpand }) => {
    const { id, title, location, event_date, pivot } = event;
    const remindMe = pivot?.remind_me ?? false;
    const { day, month } = splitDate(event_date);

    return (
        <div className={`${styles.card} ${appStyles.cristal}`}>
            <div className={styles.main} onClick={onExpand}>
                <div className={styles.dateStub}>
                    <span className={styles.stubDay}>{day}</span>
                    <span className={styles.stubMonth}>{month}</span>
                </div>

                <div className={styles.mainInfo}>
                    <div className={styles.headerRow}>
                        <p className={styles.title}>{title}</p>
                        <EventStatusBadge event={event} />
                    </div>
                    <div className={styles.locationRow}>
                        {location && <p className={styles.location}>📍 {location}</p>}
                        <ShareButton eventId={id} title={title} className={styles.mapsBtn}>
                            Compartir ↗
                        </ShareButton>
                    </div>
                    {event_date && <p className={styles.date}>🗓 {formatDate(event_date)}</p>}
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.remindBtn} ${remindMe ? styles.remindActive : ''}`}
                    onClick={() => onRemindToggle(id, !remindMe)}
                    title={remindMe ? 'Desactivar recordatorio' : 'Activar recordatorio'}
                >
                    {remindMe ? '🔔' : '🔕'} {remindMe ? 'Recordatorio activo' : 'Sin recordatorio'}
                </button>
                <button
                    className={styles.leaveBtn}
                    onClick={() => onLeave(id)}
                    title="Cancelar asistencia"
                >
                    Cancelar asistencia
                </button>
            </div>
        </div>
    );
};

/**
 * "Mis asistencias": los eventos a los que el usuario se ha apuntado.
 *
 * Los separa en Próximos y Pasados (según el estado efectivo) y permite
 * activar/desactivar el recordatorio por email o darse de baja. Al pulsar una
 * tarjeta se abre el detalle del evento dentro de la misma página.
 */
const MyAttendance = () => {
    const { getData, patch, deleteData } = useAPI();
    const { toggleLike } = useEventContext();

    const [events, setEvents]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedEvent, setSelected] = useState(null);

    useEffect(() => {
        getData(`${API}/user/events`)
            .then(res => setEvents(res?.events ?? []))
            .finally(() => setLoading(false));
    }, []);

    const handleRemindToggle = async (id, newValue) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, pivot: { ...e.pivot, remind_me: newValue } } : e
        ));
        try {
            await patch(`${API}/user/${id}/remind_me`, { remind_me: newValue });
        } catch {
            setEvents(prev => prev.map(e =>
                e.id === id ? { ...e, pivot: { ...e.pivot, remind_me: !newValue } } : e
            ));
        }
    };

    const handleLeave = async (id) => {
        const prev = events;
        setEvents(p => p.filter(e => e.id !== id));
        try {
            await deleteData(`${API}/user/${id}`);
        } catch {
            setEvents(prev);
        }
    };

    const handleLike = async (id) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, liked: !e.liked } : e));
        const backendLiked = await toggleLike(id);
        if (backendLiked !== undefined) {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, liked: backendLiked } : e));
            if (selectedEvent?.id === id) setSelected(p => ({ ...p, liked: backendLiked }));
        }
    };

    if (selectedEvent) {
        return (
            <div className={styles.page}>
                <Event
                    data={selectedEvent}
                    onBack={() => setSelected(null)}
                    onLike={handleLike}
                />
            </div>
        );
    }

    const upcoming = events.filter(e => !['finished', 'cancelled'].includes(getStatusName(e)));
    const past     = events.filter(e =>  ['finished', 'cancelled'].includes(getStatusName(e)));

    const renderList = (list) => list.map(event => (
        <AttendanceCard
            key={event.id}
            event={event}
            onRemindToggle={handleRemindToggle}
            onLeave={handleLeave}
            onExpand={() => setSelected(event)}
        />
    ));

    return (
        <div className={styles.page}>
            <h1>Mis asistencias</h1>

            {loading ? (
                <div className={styles.list}>
                    {[1, 2, 3].map(n => <MiniEventSkeleton key={n} />)}
                </div>
            ) : events.length === 0 ? (
                <EmptyState
                    icon="🎟️"
                    message="Todavía no te has apuntado a ningún evento."
                    hint="Descubre eventos en Para Ti o en Buscar."
                />
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <section>
                            <h2 className={styles.sectionTitle}>Próximos</h2>
                            <div className={styles.list}>{renderList(upcoming)}</div>
                        </section>
                    )}
                    {past.length > 0 && (
                        <section>
                            <h2 className={styles.sectionTitle}>Pasados</h2>
                            <div className={styles.list}>{renderList(past)}</div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default MyAttendance;
