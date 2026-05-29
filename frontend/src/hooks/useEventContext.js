import { useContext } from "react";
import { EventContext } from "../context/EventProvider.jsx";

/**
 * Atajo para consumir el contexto de eventos.
 * Lanza error si se usa fuera del EventProvider.
 * @returns el valor del EventContext (events, saveEvent, toggleLike...)
 */
const useEventContext = () => {
    const context = useContext(EventContext);

    if (!context) {
        throw new Error('useEventContext debe usarse dentro de un EventProvider.');
    }

    return context;
}

export default useEventContext;