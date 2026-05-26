import { useState, useEffect } from "react";
import useAPI from "../../hooks/useAPI.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import MiniEvent from "../../components/MiniEvent.jsx";
import Event from "../../components/Event.jsx";
import styles from "./Favorites.module.scss"; 
import useEventContext from "../../hooks/useEventContext.js";
import MiniEventSkeleton from "../../components/common/MiniEvenSkeleton.jsx";

const Favorites = () => {
    const { getData, loading, error } = useAPI();
    const { showMessageWithTime } = useMessageContext();
    const { toggleLike } = useEventContext();
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    
    
    const [eventToShow, setEventToShow] = useState(null);
    const [eventDetailSelected, setEventDetailSelected] = useState(false);

    const handleRemoveFavorite = async (eventId) => {
        // Filtramos el array para quitar la tarjeta de la pantalla en el acto
        setFavoriteEvents(prev => prev.filter(event => event.id !== eventId));
        
        //Avisamos a la base de datos para que sea oficial
        try {
            await toggleLike(eventId);
        } catch (error) {
            showMessageWithTime("Error al quitar el like:", "error");
        }
    };

    //Obtener los eventos favoritos al cargar la página
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
               
                const data = await getData("http://localhost:8000/api/user/favorites");
                setFavoriteEvents(data.events || []);
                
                
            } catch (err) {
                showMessageWithTime("Error cargando favoritos", "error");
            }
        };
        fetchFavorites();
    }, []);

    const showEventDetail = (id) => {
        const eventTemp = favoriteEvents.find((event) => event.id === id);
        if (eventTemp) {
            setEventToShow(eventTemp);
            setEventDetailSelected(true);
        }
    };

    const handleBack = () => {
        setEventDetailSelected(false);
        setEventToShow(null);
    };

   
  

    return (
        <div className={styles.favoritesContainer}>
            <h1>Mis Eventos Favoritos</h1>
            {loading ? (
            <div className={styles.grid}>
                {/* Pintamos 6 skeletons para rellenar la cuadrícula visualmente */}
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <MiniEventSkeleton key={n} />
                ))}
            </div>
            ) : error ? (
                <p>Hubo un error al cargar.</p>
            ) : eventDetailSelected && eventToShow ? (
                // Vista detalle
                <Event data={eventToShow} onBack={handleBack} />
            ) : (
                // Cuadrícula de MiniEvents
                <div className={styles.grid}>
                    {favoriteEvents.length > 0 ? (
                        favoriteEvents.map((event) => (
                            <MiniEvent 
                                key={event.id} 
                                data={event} 
                                onClick={() => showEventDetail(event.id)}
                                onLike={() => handleRemoveFavorite(event.id)} // ✅ AHORA SÍ CONECTAN
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