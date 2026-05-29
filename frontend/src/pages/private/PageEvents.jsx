import { useEffect } from 'react';
import AddEvent from '../../components/AddEvent.jsx';
import Events from '../../components/Events.jsx';
import styles from './PageEvents.module.scss';
import useEventContext from '../../hooks/useEventContext.js';

const TITLES = {
    add: 'Crear evento',
    edit: 'Editar evento',
    default: 'Mis eventos',
};

/**
 * "Mis eventos" (vista del artista). Conmuta entre el listado de sus eventos y
 * el formulario de crear/editar según el modo activo del EventContext.
 */
const PageEvents = () => {
    const { getEvents, addMode, editMode, event, changeDecisionAddEvent, resetModes } = useEventContext();

    useEffect(() => {
        getEvents();
        return () => resetModes();
    }, []);

    const showForm = addMode || editMode;
    const title = addMode ? TITLES.add : editMode ? TITLES.edit : TITLES.default;

    return (
        <div className={styles.pageEvents}>
            <div className={styles.header}>
                <h1>{title}</h1>
                {/* Botón visible junto al título para crear un evento nuevo. */}
                {!showForm && (
                    <button className={styles.createBtn} onClick={changeDecisionAddEvent}>
                        <span aria-hidden="true">+</span> Crear evento
                    </button>
                )}
            </div>

            {showForm ? <AddEvent key={editMode ? event.id : 'new'} /> : <Events />}
        </div>
    );
};

export default PageEvents;
