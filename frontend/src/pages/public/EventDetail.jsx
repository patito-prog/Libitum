import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAPI from '../../hooks/useAPI.js';
import Loader from '../../components/common/Loader.jsx';
import Event from '../../components/Event.jsx';
import styles from './EventDetail.module.scss';

const EventDetail = () => {
    const { id } = useParams();
    const { getData, loading } = useAPI();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        getData(`http://localhost:8000/api/events/${id}`)
            .then(res => setEvent(res.event))
            .catch(() => navigate(-1));
    }, [id]);

    if (loading && !event) return <Loader />;
    if (!event) return null;

    return (
        <div className={styles.page}>
            <Event data={event} onBack={() => navigate(-1)} />
        </div>
    );
};

export default EventDetail;
