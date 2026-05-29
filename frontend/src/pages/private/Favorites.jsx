import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import API_BASE from "../../config/api.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import MiniEvent from "../../components/MiniEvent.jsx";
import MiniEventSkeleton from "../../components/common/MiniEvenSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import styles from "./Favorites.module.scss";
import useEventContext from "../../hooks/useEventContext.js";

/**
 * "Mis favoritos": los eventos a los que el usuario ha dado like.
 * Al quitar el like, el evento desaparece de la lista al instante.
 */
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
                <EmptyState icon="⚠️" message="Hubo un error al cargar los favoritos." />
            ) : favoriteEvents.length === 0 ? (
                <EmptyState
                    icon="🤍"
                    message="Aún no le has dado me gusta a ningún evento."
                    hint="Descubre eventos en Para Ti o en Buscar."
                />
            ) : (
                <div className={styles.grid}>
                    {favoriteEvents.map(event => (
                        <MiniEvent
                            key={event.id}
                            data={event}
                            onClick={() => navigate(`/event/${event.id}`)}
                            onLike={() => handleRemoveFavorite(event.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
