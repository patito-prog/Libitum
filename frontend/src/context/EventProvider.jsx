import { createContext, useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useMessageContext from '../hooks/useMessageContext.js';

const EventContext = createContext();

const EventProvider = ({ children }) => {
    const URL_API = "http://localhost:8000/api";
    const URL_EVENTS = `${URL_API}/events`;

    const {
        loading,
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
        categories: []
    }

    // ---------------- [ALL ABOUT EVENTS] ----------------
    const [events, setEvents] = useState([]); // Los eventos de este mismo usuario.
    const [event, setEvent] = useState(initialEvent); // Evento para insertar en la base de datos.
    const [decisionAddEvent, setDecisionAddEvent] = useState(false);


    // ---------------- [ALL ABOUT CATEGORIES AND STATUSES] ----------------
    const [categories, setCategories] = useState([]); // Categorías que tiene eventos
    const [statuses, setStatuses] = useState([]); // Estado en el que está el evento.


    /**
     * Change the state of a new event
     * @param {Event} e 
     */
    const changeStatusNewEvent = (e) => {
        const { name, value, type, files } = e.target;
        let parsed = type === 'file' ? files[0] : value;
        if (name === 'categories') parsed = Array.isArray(value) ? value : [parseInt(value, 10)];
        setEvent({ ...event, [name]: parsed });
    };

    const saveEvent = async() => {
        try {
            if(event) {
                console.log(event);
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
            showMessageWithTime(`Error EventProvider getEvents: ${error}`, 'error');
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

    const changeDecisionAddEvent = () => setDecisionAddEvent(v => !v);

    useEffect(() => {
        // GetEvents no se puede hacer aquí porque previamente si no se a logeado salta el error de que !no está Autorizado!
        getCategories();
        getStatuses();
    }, []);

    const exportData = {
        events,
        event,
        categories,
        statuses,
        decisionAddEvent,
        changeStatusNewEvent,
        setLocation,
        saveEvent,
        getEvents,
        getCategories,
        getStatuses,
        changeDecisionAddEvent,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
}

export {EventContext};
export default EventProvider;