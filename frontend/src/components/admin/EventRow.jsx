import AdminActionButton from "./AdminActionButton.jsx";
import { formatDate, STATUS_LABELS } from "../../utils/validations";
import styles from "./Admin.module.scss";

const EventRow = ({ event, onDelete }) => {
    const statusName = event.status?.name ?? "";

    return (
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
                    onClick={() => onDelete(event.id)}
                />
            </td>
        </tr>
    );
};

export default EventRow;
