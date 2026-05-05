import { createContext } from 'react';
import { useState } from 'react';
import { eventIsValid } from '../model/eventModel.js';

const EventContext = createContext();

const EventProvider = ({ children }) => {
    

    const initialEvent = {
        user_id: null,
        title: '',
        slug: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null,
        event_date: '',
        price: 0,
        cover_image: null,
        max_capacity: 0,
        status_id: 1,
    }

    const [events, setEvents] = useState([]); // Los eventos de este mismo usuario.
    const [event, setEvent] = useState(initialEvent); // Evento para insertar en la base de datos.

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

    const saveEvent = async() => {
        try {
            if(event && eventIsValid(event)) {
                const data = await save(event);
                if(data) {
                    setEvents([...events, data]);
                    return data;
                }
            }
        } catch (error) {
            throw Error(`SaveEvent: ${error}`)
        }
    }

    const setLocation = ({ location, latitude, longitude }) => {
        setEvent(prev => ({ ...prev, location, latitude, longitude }));
    };

    const exportData = {
        events,
        event,
        changeStatusNewEvent,
        setLocation,
        saveEvent,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
}

export {EventContext};
export default EventProvider;