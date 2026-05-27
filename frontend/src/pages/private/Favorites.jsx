import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import API_BASE from "../../config/api.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import MiniEvent from "../../components/MiniEvent.jsx";
import MiniEventSkeleton from "../../components/common/MiniEvenSkeleton.jsx";
import styles from "./Favorites.module.scss";
import useEventContext from "../../hooks/useEventContext.js";

const Favorites = () => {
    const { getData, loading, error } = useAPI();
    const { showMessageWithTime } = useMessageContext();
    const { toggleLike } = useEventContext();
    const navigate = useNavigate();
    const [favoriteEvents, setFavoriteEvents] = useState([]);

    useEffect(() => {
        getData(`${API_BASE}/api/user/favorites`)
            .then(data => setFavoriteEvents(data.events ?? []))
            .catch(() => showMessageWithTime("Error cargando favoritos", "error"));
    }, []);

    const handleRemoveFavorite = async (eventId) => {
        setFavoriteEvents(prev => prev.filter(e => e.id !== eventId));
        try {
            await toggleLike(eventId);
        } catch {
            showMessageWithTime("Error al quitar el me gusta", "error");
        }
    };

    return (
        <div className={styles.favoritesContainer}>
            <h1>Mis Eventos Favoritos</h1>

            {loading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map(n => <MiniEventSkeleton key={n} />)}
                </div>
            ) : error ? (
                <p>Hubo un error al cargar.</p>
            ) : (
                <div className={styles.grid}>
                    {favoriteEvents.length > 0 ? (
                        favoriteEvents.map(event => (
                            <MiniEvent
                                key={event.id}
                                data={event}
                                onClick={() => navigate(`/event/${event.id}`)}
                                onLike={() => handleRemoveFavorite(event.id)}
                            />
                        ))
                    ) : (
                        <p>Aún no le has dado me gusta a ningún evento.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Favorites;
