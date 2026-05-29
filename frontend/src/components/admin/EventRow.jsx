import { useState } from "react";
import AdminActionButton from "./AdminActionButton.jsx";
import ConfirmModal from "../common/ConfirmModal.jsx";
import { formatDate, STATUS_LABELS, getStatusName } from "../../utils/validations";
import styles from "./Admin.module.scss";

/** Fila de la tabla de eventos del admin, con borrado por moderación (confirmado). */
const EventRow = ({ event, onDelete }) => {
    const statusName = getStatusName(event);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            <tr>
                <td>{event.id}</td>
                <td>{event.title}</td>
                <td>{event.artist?.name ?? "—"}</td>
                <td>{event.event_date ? formatDate(event.event_date) : "—"}</td>
                <td>
                    {statusName && (
                        <span className={`${styles.badge} ${styles[statusName]}`}>
                            {STATUS_LABELS[statusName] ?? statusName}
                        </span>
                    )}
                </td>
                <td>{event.attendees_count ?? 0}</td>
                <td>
                    <AdminActionButton
                        label="Borrar"
                        icon="🗑️"
                        onClick={() => setShowConfirm(true)}
                    />
                </td>
            </tr>

            {showConfirm && (
                <ConfirmModal
                    message={`¿Eliminar "${event.title}"?`}
                    detail="El evento y todas sus inscripciones serán eliminados."
                    confirmLabel="Sí, eliminar evento"
                    onConfirm={() => { onDelete(event.id); setShowConfirm(false); }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default EventRow;
