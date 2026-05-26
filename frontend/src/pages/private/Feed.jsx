import { useState, useEffect } from "react";
import useAPI from "../../hooks/useAPI.js";
import useEventContext from "../../hooks/useEventContext.js";
import Event from "../../components/Event.jsx";
import styles from "./Feed.module.scss";
import EventSkeleton from "../../components/common/EventSkeleton.jsx";

const Feed = () => {
    const { getData, loading, error } = useAPI();
    const { toggleLike } = useEventContext(); 
    const [feedEvents, setFeedEvents] = useState([]);
    const [mode, setMode] = useState("discover"); 

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await getData(`http://localhost:8000/api/feed?mode=${mode}`);
                const eventsArray = response.data?.data || response.data || [];
                setFeedEvents(eventsArray);
            } catch (err) {
                console.error("Error cargando el feed", err);
            }
        };
        fetchFeed();
    }, [mode]);

   
    const handleFeedLike = async (id) => {
        // Cambiamos el color en pantalla instantáneamente 
        setFeedEvents(prev => prev.map(evt => 
            evt.id === id ? { ...evt, liked: !evt.liked } : evt
        ));
        
        // Guardamos en la base de datos por detrás
        const backendLikedStatus = await toggleLike(id);

        // Si el backend devuelve algo distinto por seguridad, lo aseguramos
        if (backendLikedStatus !== undefined) {
            setFeedEvents(prev => prev.map(evt => 
                evt.id === id ? { ...evt, liked: backendLikedStatus } : evt
            ));
        }
    };

    return (
        <div className={styles.feedWrapper}>
            <div className={styles.topNav}>
                <button
                    type="button"
                    className={`${styles.navBtn} ${mode === 'following' ? styles.active : ''}`}
                    onClick={() => setMode('following')}
                >
                    Siguiendo
                </button>
                <span className={styles.separator}>|</span>
                <button
                    type="button"
                    className={`${styles.navBtn} ${mode === 'discover' ? styles.active : ''}`}
                    onClick={() => setMode('discover')}
                >
                    Para Ti
                </button>
            </div>

            <div className={styles.feedContainer}>
                {loading && feedEvents.length === 0 ? (
                    <div className={styles.feedContainer}>
                        {/* En el feed con 2 basta porque ocupan toda la pantalla */}
                        {[1, 2].map((n) => (
                            <div key={n} className={styles.snapItem}>
                                <EventSkeleton />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className={styles.messageBox}><p>Hubo un error al cargar el feed.</p></div>
                ) : feedEvents.length > 0 ? (
                    feedEvents.map((event) => (
                        <div key={event.id} className={styles.snapItem}>
                           
                            <Event data={event} onLike={handleFeedLike} />
                        </div>
                    ))
                ) : (
                    <div className={styles.messageBox}>
                        <p>
                            {mode === 'following' 
                                ? "No sigues a nadie o no han publicado eventos aún. ¡Descubre nuevos artistas en 'Para Ti'!"
                                : "No hay eventos nuevos por ahora."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;