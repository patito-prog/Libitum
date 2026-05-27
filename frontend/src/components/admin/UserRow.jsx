import { useState } from "react";
import AdminActionButton from "./AdminActionButton.jsx";
import styles from "./Admin.module.scss";

const ROLES = ["spectator", "artist", "admin"];

const UserRow = ({ user, onDelete, onRoleChange }) => {
    const currentRole = user.roles?.[0]?.name ?? "spectator";
    const [role, setRole] = useState(currentRole);
    const [saving, setSaving] = useState(false);

    const handleRoleChange = async (e) => {
        const newRole = e.target.value;
        setRole(newRole);
        setSaving(true);
        await onRoleChange(user.id, newRole);
        setSaving(false);
    };

    return (
        <tr>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td className={styles.emailCell}>{user.email}</td>
            <td>
                <select
                    className={`${styles.roleSelect} ${styles[role]}`}
                    value={role}
                    onChange={handleRoleChange}
                    disabled={saving}
                >
                    {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
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
