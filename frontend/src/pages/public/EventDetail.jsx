import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import Loader from '../../components/common/Loader.jsx';
import Event from '../../components/Event.jsx';
import useEventContext from '../../hooks/useEventContext.js';
import API_BASE from '../../config/api.js';
import styles from './EventDetail.module.scss';

/**
 * Página de detalle de un evento (/event/:id).
 * Carga el evento por id y lo pinta con la tarjeta grande (Event), gestionando
 * like e inscripción contra su propio estado local.
 */
const EventDetail = () => {
    const { id } = useParams();
    const { getData, save, deleteData, loading } = useAPI();
    const { user } = useAuthContext();
    const { toggleLike } = useEventContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        getData(`${API_BASE}/api/events/${id}`)
            .then(res => setEvent(res.event))
            .catch(() => {
                showMessageWithTime('No se pudo cargar el evento.', 'error');
                navigate(-1);
            });
    }, [id]);

    const handleInscribe = async (eventId, isSignedUp) => {
        if (!user) {
            showMessageWithTime('Para poder apuntarte debes registrarte primero', 'error');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        setEvent(prev => ({ ...prev, signed_up: !isSignedUp }));
        try {
            if (isSignedUp) {
                await deleteData(`${API_BASE}/api/user/${eventId}`);
            } else {
                await save(`${API_BASE}/api/user/event`, { event_id: eventId });
            }
        } catch {
            setEvent(prev => ({ ...prev, signed_up: isSignedUp }));
        }
    };

    const handleLike = async (eventId) => {
        if (!user) {
            showMessageWithTime('Inicia sesión para guardar eventos', 'error');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        // Optimista: refleja el cambio en el estado local del detalle
        setEvent(prev => ({ ...prev, liked: !prev.liked }));
        const backendLiked = await toggleLike(eventId);
        if (backendLiked !== undefined) {
            setEvent(prev => ({ ...prev, liked: backendLiked }));
        }
    };

    if (loading && !event) return <Loader />;
    if (!event) return null;

    return (
        <div className={styles.page}>
            <Event data={event} onBack={() => navigate(-1)} onLike={handleLike} onInscribe={handleInscribe} />
        </div>
    );
};

export default EventDetail;
