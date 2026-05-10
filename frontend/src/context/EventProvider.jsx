import { createContext, useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useMessageContext from '../hooks/useMessageContext.js';

const EventContext = createContext();

const EventProvider = ({ children }) => {
    const URL_API = "http://localhost:8000/api";
    const URL_EVENTS = `${URL_API}/events`;

    const {
        save,
        getData,
    } = useAPI();

    const {
        showMessageWithTime,
    } = useMessageContext();

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

    // ---------------- [ALL ABOUT EVENTS] ----------------
    const [events, setEvents] = useState([]); // Los eventos de este mismo usuario.
    const [event, setEvent] = useState(initialEvent); // Evento para insertar en la base de datos.

    // ---------------- [ALL ABOUT CATEGORIES AND STATUSES] ----------------
    const [categories, setCategories] = useState([]); // Categorías que tiene eventos
    const [statuses, setStatuses] = useState([]); // Estado en el que está el evento.


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
            if(event) {
                const data = await save(URL_EVENTS, event);
                if(data?.event) {
                    setEvents([...events, data.event]);
                    return data.event;
                }
            }
        } catch (error) {
            showMessageWithTime(`Error EventProvider saveEvent: ${error}`, 'error');
        }
    }

    const getEvents = async() => {
        try {
            const data = await getData(URL_EVENTS);
            const events = data.events;
            if(events && events.length > 0) {
                setEvents(events);
            }
        } catch (error) {
            showMessageWithTime(`Error EventProvider saveEvent: ${error}`, 'error');
        }
    }

    /**
     * Catch all of categories in our data base.
     */
    const getCategories = async() => {
        try {
            const data = await getData(`${URL_API}/categories`);
            const categories = data.categories;
            if(categories && categories.length > 0) {
                setCategories(categories);
            }
        } catch (error) {
            showMessageWithTime(`Error EventProvider getCategories: ${error}`, 'error');
        }
    }

    const getStatuses = async() => {
        try {
            const data = await getData(`${URL_API}/statuses`);
            const statuses = data.statuses;
            if(statuses && statuses.length > 0) {
                setStatuses(statuses);
            }
        } catch (error) {
            showMessageWithTime(`Error EventProvider getStatuses: ${error}`, 'error');
        }
    }

    const setLocation = ({ location, latitude, longitude }) => {
        setEvent(prev => ({ ...prev, location, latitude, longitude }));
    };

    useEffect(() => {
        getEvents();
        getCategories();
        getStatuses();
    }, []);

    const exportData = {
        events,
        event,
        categories,
        statuses,
        changeStatusNewEvent,
        setLocation,
        saveEvent,
        getCategories,
        getStatuses,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
}

export {EventContext};
export default EventProvider;