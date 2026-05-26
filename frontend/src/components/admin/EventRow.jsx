import AdminActionButton from "./AdminActionButton.jsx";

const EventRow = ({ event, onDelete }) => (
    <tr>
        <td>{event.id}</td>
        <td>{event.title}</td>
        <td>{event.date}</td>
        <td>
            <AdminActionButton 
                label="Borrar" 
                icon="🗑️" 
                onClick={() => onDelete(event.id)} 
            />
        </td>
    </tr>
);
export default EventRow;