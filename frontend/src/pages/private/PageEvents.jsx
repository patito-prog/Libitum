import { useState, useEffect } from 'react';
import AddEvent from '../../components/AddEvent.jsx';
import Events from '../../components/Events.jsx';
import ButtonAdd from '../../components/common/ButtonAdd.jsx';
import styles from './PageEvents.module.scss';
import useEventContext from '../../hooks/useEventContext.js';

const PageEvents = () => {
    const { 
        getEvents,
        decisionAddEvent,
        changeDecisionAddEvent,
    } = useEventContext();

    useEffect(() => {
        getEvents();
    }, []);

    return (
        <>
            <div className={styles.pageEvents}>
                <h1>{decisionAddEvent ? 'Crear evento' :'Mis eventos'}</h1>
                {decisionAddEvent ? <AddEvent /> : <Events />}
                {!decisionAddEvent &&
                    <ButtonAdd
                        title="Añadir evento"
                        alt="Añadir evento"
                        onClick={changeDecisionAddEvent}
                    />
                }
            </div>
        </>
    );
};

export default PageEvents;
