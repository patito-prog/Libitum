import { useState } from 'react';
import AddEvent from '../components/AddEvent.jsx';
import Events from '../components/Events.jsx';
import styles from  './PageEvents.module.scss';

const PageEvents = () => {
    const [ decisionAddEvent, setDecisionAddEvent ] = useState(false); // If the user want to add a Event. Here have a state to appear the form.
    /**
     * Function to appear o disappear the form of AddEvent to add it.
     */
    const changeDecisionAddEvent = () => {
        const theChange = !decisionAddEvent;
        setDecisionAddEvent(theChange);
    }
    return (
        <>
            <div>
                <h1>Mis eventos</h1>
                {decisionAddEvent && <AddEvent />}

                <Events />
                <button onClick={changeDecisionAddEvent}>
                    <img 
                        src="/image-add.png"
                        alt="Añadir evento"
                        className={styles.btnAdd}
                    />
                </button>

            </div>
        </>
    );
}

export default PageEvents;