import useEventContext from "../hooks/useEventContext.js";
// Class
import MiniEvents from "./MiniEvents.jsx";

const Events = () => {
    const {
        events,
    } = useEventContext();

    return (
        <>
            {
                events && events.length > 0 ?
                events.map((event, i, a) => {
                    return <MiniEvents key={event.id} data={event}/>
                }) :
                <p>No hay eventos registrados</p>
            }
        </>
    )
}

export default Events;