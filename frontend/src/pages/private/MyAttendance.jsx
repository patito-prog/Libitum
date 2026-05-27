import { useState, useEffect } from 'react';
import useAPI from '../../hooks/useAPI.js';
import useEventContext from '../../hooks/useEventContext.js';
import Event from '../../components/Event.jsx';
import MiniEventSkeleton from '../../components/common/MiniEvenSkeleton.jsx';
import styles from './MyAttendance.module.scss';
import appStyles from '../../App.module.scss';
import { formatDate, STATUS_LABELS } from '../../utils/validations';
import API_BASE from '../../config/api.js';

const API = `${API_BASE}/api`;

const AttendanceCard = ({ event, onRemindToggle, onLeave, onExpand }) => {
    const { id, title, location, event_date, status, liked, pivot } = event;
    const statusName = status?.name ?? '';
    const remindMe = pivot?.remind_me ?? false;

    return (
        <div className={`${styles.card} ${appStyles.cristal}`}>
            <div className={styles.main} onClick={onExpand}>
                <div className={styles.headerRow}>
                    <p className={styles.title}>{title}</p>
                    <span className={`${styles.badge} ${styles[statusName]}`}>{STATUS_LABELS[statusName] ?? statusName}</span>
                </div>
                {location && <p className={styles.location}>📍 {location}</p>}
                {event_date && <p className={styles.date}>🗓 {formatDate(event_date)}</p>}
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

    return (
        <div className={styles.page}>
            <h1>Mis asistencias</h1>

            {loading ? (
                <div className={styles.list}>
                    {[1, 2, 3].map(n => <MiniEventSkeleton key={n} />)}
                </div>
            ) : events.length === 0 ? (
                <div className={styles.empty}>
                    <p>Todavía no te has apuntado a ningún evento.</p>
                    <p className={styles.hint}>Descubre eventos en <strong>Para Ti</strong> o en <strong>Buscar</strong>.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {events.map(event => (
                        <AttendanceCard
                            key={event.id}
                            event={event}
                            onRemindToggle={handleRemindToggle}
                            onLeave={handleLeave}
                            onExpand={() => setSelected(event)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAttendance;
