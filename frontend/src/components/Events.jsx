import useEventContext from "../hooks/useEventContext.js";
// Class
import MiniEvents from "./MiniEvents.jsx";

const Events = () => {
    const {
        events,
    } = useEventContext();

    const { eventToShow, setEventToShow} = useState({})
    const [eventDetailSelected, setEventDetailSelected] = useState(false);

    const showEventDetail = (id) => {
        if(!id) return;
        setEventDetailSelected(!eventDetailSelected);
        const eventTemp = events.filter((event) => {
            return event.id == id;
        });
        setEventToShow(eventTemp);
    }

    return (
        <>
            <div className="" onClick={(e) => {
                if (e.target.closest(".mini-events")) {
                    showEventDetail(e.id);
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