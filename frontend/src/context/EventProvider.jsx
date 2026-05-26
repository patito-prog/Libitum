import { createContext, useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useMessageContext from '../hooks/useMessageContext.js';

const EventContext = createContext();

const EventProvider = ({ children }) => {
    const URL_API = "http://localhost:8000/api";
    const URL_EVENTS = `${URL_API}/events`;

    const { save, getData, edit } = useAPI();
    const { showMessageWithTime } = useMessageContext();

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
    const [addMode, setAddMode] = useState(false);
    const [editMode, setEditMode] = useState(false);



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
        setEvent(prev => ({ ...prev, [name]: parsed }));
    };

    const saveEvent = async () => {
        try {
            const data = await save(URL_EVENTS, event);
            if (data?.event) {
                setEvents(prev => [...prev, data.event]);
                setAddMode(false);
                setEvent(initialEvent);
                showMessageWithTime('Evento creado correctamente', 'ok');
                return data.event;
            }
        } catch (error) {
            showMessageWithTime(`Error al crear el evento: ${error}`, 'error');
        }
    };

    const updateEvent = async () => {
        try {
            const data = await edit(`${URL_EVENTS}/${event.id}`, event);
            if (data) {
                setEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...data.event } : e));
                setEditMode(false);
                setEvent(initialEvent);
                showMessageWithTime('Evento actualizado correctamente', 'ok');
            }
        } catch (error) {
            showMessageWithTime(`Error al actualizar el evento: ${error}`, 'error');
        }
    };

    const setEventForEdit = (eventData) => {
        setEvent({
            ...initialEvent,
            ...eventData,
            categories: eventData.categories?.map(c => c.id) ?? [],
        });
        setEditMode(true);
    };

    const getEvents = async () => {
        try {
            const data = await getData(URL_EVENTS);
            if (data.events?.length > 0) setEvents(data.events);
        } catch (error) {
            showMessageWithTime(`Error al cargar eventos: ${error}`, 'error');
        }
    };

    const getCategories = async () => {
        try {
            const data = await getData(`${URL_API}/categories`);
            if (data.categories?.length > 0) setCategories(data.categories);
        } catch (error) {
            showMessageWithTime(`Error al cargar categorías: ${error}`, 'error');
        }
    };

    const getStatuses = async () => {
        try {
            const data = await getData(`${URL_API}/statuses`);
            if (data.statuses?.length > 0) setStatuses(data.statuses);
        } catch (error) {
            showMessageWithTime(`Error al cargar estados: ${error}`, 'error');
        }
    };

    const setLocation = ({ location, latitude, longitude }) => {
        setEvent(prev => ({ ...prev, location, latitude, longitude }));
    };
    
    const changeDecisionAddEvent = () => {
        setEvent(initialEvent);
        setAddMode(v => !v);
    };

    const changeDecisionEditMode = () => {
        setEvent(initialEvent);
        setEditMode(v => !v);
    };

    const resetModes = () => {
        setAddMode(false);
        setEditMode(false);
        setEvent(initialEvent);
    };

    //METODO PARA LIKES
    /**
     * Alterna el like de un evento, con llamarlo desde un onClick ya se cambia el valor del like. */
    const toggleLike = async (eventId) => {
        try {
            
            const response = await save(`${URL_EVENTS}/${eventId}/like`, {});
            
            //cambiar su estado de like sin mutar el array original.
            setEvents(prevEvents => prevEvents.map(event => 
                event.id === eventId 
                    ? { ...event, liked: response.liked } 
                    : event
            ));

            return response.liked;

        } catch (error) {
            showMessageWithTime("No se pudo procesar el like.", "error");
            
        }
    };

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
        addMode,
        editMode,
        changeStatusNewEvent,
        setLocation,
        saveEvent,
        updateEvent,
        setEventForEdit,
        getEvents,
        getCategories,
        getStatuses,
        changeDecisionAddEvent,
        changeDecisionEditMode,
        toggleLike,
        resetModes,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
};

export { EventContext };
export default EventProvider;
