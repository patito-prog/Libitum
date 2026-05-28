import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import Loader from '../../components/common/Loader.jsx';
import Event from '../../components/Event.jsx';
import API_BASE from '../../config/api.js';
import styles from './EventDetail.module.scss';

const EventDetail = () => {
    const { id } = useParams();
    const { getData, save, deleteData, loading } = useAPI();
    const { user } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        getData(`${API_BASE}/api/events/${id}`)
            .then(res => setEvent(res.event))
            .catch(() => navigate(-1));
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

    if (loading && !event) return <Loader />;
    if (!event) return null;

    return (
        <div className={styles.page}>
            <Event data={event} onBack={() => navigate(-1)} onInscribe={handleInscribe} />
        </div>
    );
};

export default EventDetail;
