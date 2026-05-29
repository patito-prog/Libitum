import { useEffect } from 'react';
import AddEvent from '../../components/AddEvent.jsx';
import Events from '../../components/Events.jsx';
import ButtonAdd from '../../components/common/ButtonAdd.jsx';
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
            <h1>{title}</h1>

            {showForm ? <AddEvent key={editMode ? event.id : 'new'} /> : <Events />}

            {!showForm && (
                <ButtonAdd
                    title="Añadir evento"
                    alt="Añadir evento"
                    onClick={changeDecisionAddEvent}
                />
            )}
        </div>
    );
};

export default PageEvents;
