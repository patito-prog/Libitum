import { createContext } from 'react';
import { useState } from 'react';

const EventContext = createContext();

const EventProvider = ({ children }) => {

    const initialEvent = {
        
    }

    const [events, setEvents] = useState([]);
    const [event, setEvent] = useState(initialEvent);

    /**
     * Change the state of a new event
     * @param {Event} e 
     */
    const changeStatusNewEvent = (e) => {
    const { name, value, type, files } = e.target;
    setEvent({
        ...event,
        [name]: type === 'file' ? files[0] : value
    });
};

    const exportData = {
        events,
        event,
        changeStatusNewEvent,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
}

export {EventContext};
export default EventProvider;