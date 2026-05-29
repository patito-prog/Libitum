import styles from "./Admin.module.scss";

/** Botón de acción del admin con icono opcional (ej. eliminar). */
const AdminActionButton = ({ onClick, label, icon }) => {
    return (
        <button className={styles.buttonAdmin} onClick={onClick}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {label}
        </button>
    );
};
export default AdminActionButton;