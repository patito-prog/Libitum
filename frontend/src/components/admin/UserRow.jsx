import AdminActionButton from "./AdminActionButton.jsx";
import styles from "./Admin.module.scss";

const UserRow = ({ user, onDelete }) => {
    // Extraemos el rol, si existe, para aplicar el color
    const roleName = user.roles?.[0]?.name || 'user';

    return(
        <tr>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
                {/* Le pasamos la clase base "badge" y el modificador de color */}
                <span className={`${styles.badge} ${styles[roleName]}`}>
                    {roleName}
                </span>
            </td>
            <td>
                <AdminActionButton 
                    label="Eliminar" 
                    icon="🗑️" 
                    onClick={() => onDelete(user.id)} 
                />
            </td>
        </tr>
    );
};
export default UserRow;