import { useState } from "react";
import useEventContext from "../hooks/useEventContext.js";
import MiniEvent from "./MiniEvent.jsx";
import Event from "./Event.jsx";

const Events = () => {
    const { events } = useEventContext();

    const [selectedId, setSelectedId] = useState(null);

    const eventToShow = events.find(e => e.id === selectedId) ?? null;

    return (
        <>
            {eventToShow
                ? <Event
                    data={eventToShow}
                    onBack={() => setSelectedId(null)}
                />
                : events && events.length > 0
                    ? events.map(event => (
                        <MiniEvent key={event.id} data={event} onClick={() => setSelectedId(event.id)} />
                    ))
                    : <p>No hay eventos registrados</p>
            }
        </>
    );
}

export default Events;