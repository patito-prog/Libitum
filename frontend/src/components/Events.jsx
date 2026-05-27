import { useState } from "react";
import useEventContext from "../hooks/useEventContext.js";
import MiniEvent from "./MiniEvent.jsx";
import Event from "./Event.jsx";
import styles from "./Events.module.scss";

const Events = () => {
    const { events } = useEventContext();

    const [eventToShow, setEventToShow]           = useState({});
    const [eventDetailSelected, setEventDetailSelected] = useState(false);

    const showEventDetail = (id) => {
        const found = events.find(e => e.id === id);
        if (found) {
            setEventToShow(found);
            setEventDetailSelected(true);
        }
    };

    const drafts    = events.filter(e => e.status?.name === 'draft');
    const published = events.filter(e => e.status?.name !== 'draft');

    if (eventDetailSelected) {
        return (
            <div className="event-detail">
                <Event
                    data={eventToShow}
                    editable={true}
                    onBack={() => setEventDetailSelected(false)}
                />
            </div>
        );
    }

    return (
        <>
            {published.length > 0 ? (
                <div className={styles.list}>
                    {published.map(event => (
                        <MiniEvent key={event.id} data={event} onClick={() => showEventDetail(event.id)} />
                    ))}
                </div>
            ) : (
                <p className={styles.empty}>No hay eventos publicados todavía.</p>
            )}

            {drafts.length > 0 && (
                <section className={styles.draftsSection}>
                    <h3 className={styles.draftsTitle}>
                        <span className={styles.draftsDot} />
                        Borradores ({drafts.length})
                    </h3>
                    <div className={styles.list}>
                        {drafts.map(event => (
                            <MiniEvent key={event.id} data={event} onClick={() => showEventDetail(event.id)} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

export default Events;
