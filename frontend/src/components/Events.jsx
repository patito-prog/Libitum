import { useState } from "react";
import useEventContext from "../hooks/useEventContext.js";
import MiniEvent from "./MiniEvent.jsx";
import Event from "./Event.jsx";
import ConfirmModal from "./common/ConfirmModal.jsx";
import EmptyState from "./common/EmptyState.jsx";
import styles from "./Events.module.scss";

/**
 * Listado de eventos del artista dentro de "Mis eventos".
 *
 * Los separa en tres grupos: activos (publicados/en directo), borradores y
 * cancelados. Permite cancelar los activos y borrar borradores/cancelados,
 * siempre con el modal de confirmación. Al pulsar uno se abre su detalle editable.
 */
const Events = () => {
    const { events, deleteEvent, cancelEvent } = useEventContext();
    const [confirmTarget, setConfirmTarget] = useState(null);

    const requestDelete = (e, id, title) => {
        e.stopPropagation();
        setConfirmTarget({ id, title, action: 'delete' });
    };

    const requestCancel = (e, id, title) => {
        e.stopPropagation();
        setConfirmTarget({ id, title, action: 'cancel' });
    };

    const handleConfirm = () => {
        if (confirmTarget.action === 'delete') deleteEvent(confirmTarget.id);
        else cancelEvent(confirmTarget.id);
        setConfirmTarget(null);
    };

    const [eventToShow, setEventToShow]           = useState({});
    const [eventDetailSelected, setEventDetailSelected] = useState(false);

    const showEventDetail = (id) => {
        const found = events.find(e => e.id === id);
        if (found) {
            setEventToShow(found);
            setEventDetailSelected(true);
        }
    };

    const drafts     = events.filter(e => e.status?.name === 'draft');
    const cancelled  = events.filter(e => e.status?.name === 'cancelled');
    const active     = events.filter(e => !['draft', 'cancelled'].includes(e.status?.name));

    if (eventDetailSelected) {
        return (
            <div className="event-detail">
                <Event
                    data={eventToShow}
                    editable={true}
                    onBack={() => setEventDetailSelected(false)}
                />
            </div>
        );
    }

    return (
        <>
            {active.length > 0 ? (
                <div className={styles.list}>
                    {active.map(event => (
                        <div key={event.id} className={styles.eventRow}>
                            <MiniEvent data={event} onClick={() => showEventDetail(event.id)} />
                            <button
                                className={styles.cancelBtn}
                                onClick={e => requestCancel(e, event.id, event.title)}
                                title="Cancelar evento"
                            >✕</button>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon="📅" message="No hay eventos publicados todavía." />
            )}

            {drafts.length > 0 && (
                <section className={styles.draftsSection}>
                    <h3 className={styles.draftsTitle}>
                        <span className={styles.draftsDot} />
                        Borradores ({drafts.length})
                    </h3>
                    <div className={styles.list}>
                        {drafts.map(event => (
                            <div key={event.id} className={styles.eventRow}>
                                <MiniEvent data={event} onClick={() => showEventDetail(event.id)} />
                                <button
                                    className={styles.deleteBtn}
                                    onClick={e => requestDelete(e, event.id, event.title)}
                                    title="Eliminar borrador"
                                >🗑️</button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {cancelled.length > 0 && (
                <section className={styles.draftsSection}>
                    <h3 className={styles.draftsTitle}>
                        <span className={styles.draftsDot} style={{ background: '#f87171' }} />
                        Cancelados ({cancelled.length})
                    </h3>
                    <div className={styles.list}>
                        {cancelled.map(event => (
                            <div key={event.id} className={styles.eventRow}>
                                <MiniEvent data={event} onClick={() => showEventDetail(event.id)} />
                                <button
                                    className={styles.deleteBtn}
                                    onClick={e => requestDelete(e, event.id, event.title)}
                                    title="Eliminar evento"
                                >🗑️</button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {confirmTarget && (
                <ConfirmModal
                    message={
                        confirmTarget.action === 'delete'
                            ? `¿Eliminar "${confirmTarget.title}"?`
                            : `¿Cancelar "${confirmTarget.title}"?`
                    }
                    detail={
                        confirmTarget.action === 'delete'
                            ? 'El evento se borrará permanentemente.'
                            : 'El evento quedará como cancelado y los inscritos lo verán así.'
                    }
                    confirmLabel={confirmTarget.action === 'delete' ? 'Sí, eliminar' : 'Sí, cancelar evento'}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmTarget(null)}
                />
            )}
        </>
    );
};

export default Events;
