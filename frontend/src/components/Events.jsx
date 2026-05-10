import { useState } from "react";
import useEventContext from "../hooks/useEventContext.js";
// Class
import MiniEvents from "./MiniEvents.jsx";
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
                    showEventDetail(Number(miniEvent.id));
                }
            }}>
                { eventDetailSelected && <Event data={eventToShow}/>}
                {
                    events && events.length > 0 ?
                    events.map((event, i, a) => {
                        return <MiniEvents key={event.id} data={event}/>
                    }) :
                    <p>No hay eventos registrados</p>
                }
            </div>
            
        </>
    )
}

export default Events;