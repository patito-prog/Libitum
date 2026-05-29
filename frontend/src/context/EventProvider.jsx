import { createContext, useEffect, useState } from 'react';
import useAPI from '../hooks/useAPI';
import useMessageContext from '../hooks/useMessageContext.js';
import API_BASE from '../config/api.js';

/**
 * Contexto global de eventos.
 *
 * Centraliza TODO lo relacionado con eventos para no andar pasando props por
 * media app: la lista de eventos del artista, el evento que se está creando/
 * editando, las categorías y estados disponibles, y las acciones (crear,
 * editar, borrar, cancelar, dar like...).
 *
 * Cualquier componente que se cuelgue de este provider tira de `useEventContext()`
 * y ya tiene acceso a todo sin acoplarse a las llamadas a la API.
 */
const EventContext = createContext();

const EventProvider = ({ children }) => {
    // Rutas base de la API. Las montamos una vez aquí y reutilizamos.
    const URL_API = `${API_BASE}/api`;
    const URL_EVENTS = `${URL_API}/events`;

    // Métodos HTTP genéricos (cada uno ya mete el token de Sanctum por dentro).
    const { save, getData, edit, patch, uploadFile, deleteData } = useAPI();
    // Para lanzar los toast de feedback al usuario.
    const { showMessageWithTime } = useMessageContext();

    /**
     * Molde de un evento vacío. Lo usamos como punto de partida del formulario
     * de "crear evento" y para resetear el estado cuando se cancela o se guarda.
     * status_id = 1 → borrador por defecto (el artista decide si publica).
     */
    const initialEvent = {
        user_id: null,
        title: '',
        slug: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null,
        event_date: '',
        duration_hours: null,
        price: 0,
        cover_image: null,
        max_capacity: null,
        status_id: 1,
        categories: [],
    }

    // ── Estado de eventos ──
    const [events, setEvents] = useState([]);          // Eventos creados por el propio artista
    const [event, setEvent]   = useState(initialEvent); // Evento en construcción (crear/editar)
    const [addMode, setAddMode]   = useState(false);     // ¿Estamos en el form de crear?
    const [editMode, setEditMode] = useState(false);     // ¿Estamos en el form de editar?

    // ── Catálogos auxiliares ──
    const [categories, setCategories] = useState([]); // Categorías musicales disponibles
    const [statuses, setStatuses]     = useState([]); // Estados posibles (borrador, publicado...)

    /**
     * Handler genérico para los inputs del formulario de evento.
     * Va actualizando el objeto `event` campo a campo según se escribe.
     *
     * Ojo con los casos especiales:
     *  - file: nos quedamos con el File en bruto (la portada se sube aparte).
     *  - categories: siempre lo guardamos como array de ids.
     *  - duration_hours / status_id: los forzamos a número (vienen como string del select).
     *
     * @param {Event} e Evento de cambio del input
     */
    const changeStatusNewEvent = (e) => {
        const { name, value, type, files } = e.target;
        let parsed = type === 'file' ? files[0] : value;
        if (name === 'categories')     parsed = Array.isArray(value) ? value : [parseInt(value, 10)];
        if (name === 'duration_hours') parsed = value === '' ? null : parseInt(value, 10);
        if (name === 'status_id')      parsed = parseInt(value, 10);
        setEvent(prev => ({ ...prev, [name]: parsed }));
    };

    /**
     * Crea un evento nuevo.
     *
     * La portada NO viaja en el JSON: primero creamos el evento, y si había
     * imagen la subimos en una segunda llamada (multipart) usando el id que
     * nos devuelve el back. Así separamos datos de fichero.
     *
     * @returns {Promise<Object|undefined>} El evento guardado, o undefined si falla.
     */
    const saveEvent = async () => {
        try {
            const coverFile = event.cover_image instanceof File ? event.cover_image : null;
            const payload = { ...event, cover_image: undefined };

            const data = await save(URL_EVENTS, payload);
            if (data?.event) {
                let savedEvent = data.event;

                // Si hay portada, la subimos aparte y fusionamos la url que devuelve.
                if (coverFile) {
                    const fd = new FormData();
                    fd.append('cover', coverFile);
                    const coverRes = await uploadFile(`${URL_EVENTS}/${savedEvent.id}/cover`, fd);
                    if (coverRes?.data?.cover_image) {
                        savedEvent = { ...savedEvent, cover_image: coverRes.data.cover_image };
                    }
                }

                setEvents(prev => [...prev, savedEvent]);
                setAddMode(false);
                setEvent(initialEvent);
                showMessageWithTime('Evento creado correctamente', 'ok');
                return savedEvent;
            }
        } catch (error) {
            showMessageWithTime(`Error al crear el evento: ${error}`, 'error');
        }
    };

    /**
     * Actualiza el evento que se está editando (mismo rollo que saveEvent pero con PUT).
     * La portada se vuelve a subir aparte solo si el usuario ha puesto una nueva.
     */
    const updateEvent = async () => {
        try {
            const coverFile = event.cover_image instanceof File ? event.cover_image : null;
            const payload = { ...event, cover_image: undefined };

            const data = await edit(`${URL_EVENTS}/${event.id}`, payload);
            if (data) {
                let updatedEvent = data.event;

                if (coverFile) {
                    const fd = new FormData();
                    fd.append('cover', coverFile);
                    const coverRes = await uploadFile(`${URL_EVENTS}/${event.id}/cover`, fd);
                    if (coverRes?.data?.cover_image) {
                        updatedEvent = { ...updatedEvent, cover_image: coverRes.data.cover_image };
                    }
                }

                // Reemplazamos el evento dentro de la lista sin tocar el resto.
                setEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...updatedEvent } : e));
                setEditMode(false);
                setEvent(initialEvent);
                showMessageWithTime('Evento actualizado correctamente', 'ok');
            }
        } catch (error) {
            showMessageWithTime(`Error al actualizar el evento: ${error}`, 'error');
        }
    };

    /**
     * Vuelca un evento existente en el formulario y abre el modo edición.
     * Las categorías vienen como objetos, así que las aplanamos a array de ids.
     *
     * @param {Object} eventData Evento a editar
     */
    const setEventForEdit = (eventData) => {
        setEvent({
            ...initialEvent,
            ...eventData,
            categories: eventData.categories?.map(c => c.id) ?? [],
        });
        setEditMode(true);
    };

    /** Trae los eventos del artista logueado y los mete en el estado. */
    const getEvents = async () => {
        try {
            const data = await getData(URL_EVENTS);
            setEvents(data.events ?? []);
        } catch (error) {
            showMessageWithTime(`Error al cargar eventos: ${error}`, 'error');
        }
    };

    /** Carga el catálogo de categorías musicales (para el multiselect del form). */
    const getCategories = async () => {
        try {
            const data = await getData(`${URL_API}/categories`);
            if (data.categories?.length > 0) setCategories(data.categories);
        } catch (error) {
            showMessageWithTime(`Error al cargar categorías: ${error}`, 'error');
        }
    };

    /** Carga los estados posibles de un evento (borrador, publicado, etc.). */
    const getStatuses = async () => {
        try {
            const data = await getData(`${URL_API}/statuses`);
            if (data.statuses?.length > 0) setStatuses(data.statuses);
        } catch (error) {
            showMessageWithTime(`Error al cargar estados: ${error}`, 'error');
        }
    };

    /**
     * Cancela un evento (pasa su estado a "cancelled").
     * Update optimista: lo marcamos cancelado al momento en la UI y, si el back
     * peta, revertimos a la lista anterior.
     *
     * @param {number} eventId
     */
    const cancelEvent = async (eventId) => {
        const cancelledStatus = statuses.find(s => s.name === 'cancelled');
        if (!cancelledStatus) return;
        const previous = events;
        setEvents(prev => prev.map(e =>
            e.id === eventId
                ? { ...e, status: cancelledStatus, effective_status_name: 'cancelled' }
                : e
        ));
        try {
            await patch(`${URL_EVENTS}/${eventId}/status`, { status_id: cancelledStatus.id });
            showMessageWithTime('Evento cancelado', 'ok');
        } catch {
            setEvents(previous);
            showMessageWithTime('No se pudo cancelar el evento', 'error');
        }
    };

    /**
     * Borra un evento del todo. También optimista: lo quitamos ya de la lista
     * y lo devolvemos si la petición falla.
     *
     * @param {number} eventId
     */
    const deleteEvent = async (eventId) => {
        const previous = events;
        setEvents(prev => prev.filter(e => e.id !== eventId));
        try {
            await deleteData(`${URL_EVENTS}/${eventId}`);
            showMessageWithTime('Evento eliminado correctamente', 'ok');
        } catch {
            setEvents(previous);
            showMessageWithTime('No se pudo eliminar el evento', 'error');
        }
    };

    /**
     * Guarda la ubicación elegida en el buscador de mapas dentro del evento.
     * @param {{location:string, latitude:number, longitude:number}} loc
     */
    const setLocation = ({ location, latitude, longitude }) => {
        setEvent(prev => ({ ...prev, location, latitude, longitude }));
    };

    /** Abre/cierra el formulario de crear evento (reseteando el evento en curso). */
    const changeDecisionAddEvent = () => {
        setEvent(initialEvent);
        setAddMode(v => !v);
    };

    /** Abre/cierra el modo edición (reseteando el evento en curso). */
    const changeDecisionEditMode = () => {
        setEvent(initialEvent);
        setEditMode(v => !v);
    };

    /** Apaga ambos modos y limpia el formulario. Útil al salir de la página. */
    const resetModes = () => {
        setAddMode(false);
        setEditMode(false);
        setEvent(initialEvent);
    };

    /**
     * Alterna el like de un evento. El back hace toggle (si no hay lo pone, si
     * ya está lo quita) y nos devuelve el estado final, que reflejamos en la lista.
     *
     * @param {number} eventId
     * @returns {Promise<boolean|undefined>} estado del like según el back
     */
    const toggleLike = async (eventId) => {
        try {
            const response = await save(`${URL_EVENTS}/${eventId}/like`, {});

            // Actualizamos solo ese evento, sin mutar el array original.
            setEvents(prevEvents => prevEvents.map(event =>
                event.id === eventId
                    ? { ...event, liked: response.liked }
                    : event
            ));

            return response.liked;
        } catch {
            showMessageWithTime("No se pudo procesar el like.", "error");
        }
    };

    // Al montar el provider cargamos los catálogos.
    // Los eventos NO se piden aquí: si el usuario aún no ha iniciado sesión el
    // back devuelve 401, así que getEvents() se llama desde las páginas privadas.
    useEffect(() => {
        getCategories();
        getStatuses();
    }, []);

    // Todo lo que exponemos al resto de la app.
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
        deleteEvent,
        cancelEvent,
    }

    return (
        <EventContext.Provider value={exportData}>
            {children}
        </EventContext.Provider>
    );
};

export { EventContext };
export default EventProvider;
