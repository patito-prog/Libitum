import styles from "./Admin.module.scss";

/** Tabla genérica del admin: recibe las cabeceras y las filas como children. */
const AdminTable = ({ headers, children }) => (
    <table className={styles.adminTable}>
        <thead>
            <tr>
                {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {children}
        </tbody>
    </table>
);
export default AdminTable;