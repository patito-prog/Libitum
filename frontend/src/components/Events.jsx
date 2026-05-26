import { useState } from "react";
import useEventContext from "../hooks/useEventContext.js";
// Class
import MiniEvent from "./MiniEvent.jsx";
import Event from "./Event.jsx";

const Events = () => {
    const {
        events,
    } = useEventContext();

    const [eventToShow, setEventToShow] = useState({})
    const [eventDetailSelected, setEventDetailSelected] = useState(false);

    const showEventDetail = (id) => {
        const eventTemp = events.find((event) => event.id === id);
        if (eventTemp) {
            setEventToShow(eventTemp);
            setEventDetailSelected(true);
        }
    }

    return (
        <>
            <div className="" onClick={(e) => {
                const miniEvent = e.target.closest(".mini-event");
                if (miniEvent) {
                    console.log("Entra")
                    showEventDetail(Number(miniEvent.id));
                    return;
                }
                // si no ha entrado en el if de miniEvent es que está visualizandose el Evento con más detalles.
                const eventDetail = e.target.closest(".event-detail");
                if (eventDetail) {
                    console.log("object")
                    setEventDetailSelected(!eventDetailSelected); // Lo ponemos a false
                }
            }}>
                { eventDetailSelected ? <Event data={eventToShow}/> :
                    events && events.length > 0 ?
                    events.map((event) => {
                        return <MiniEvent key={event.id} data={event} onClick={() => showEventDetail(event.id)}/>
                    }) :
                    <p>No hay eventos registrados</p>
                }
            </div>
            
        </>
    )
}

export default Events;