import styles from "./Admin.module.scss";

/**
 * Tabla genérica del admin: recibe las cabeceras y las filas como children.
 * Va envuelta en un contenedor con scroll horizontal para que en móvil no
 * reviente el layout (la tabla mantiene su ancho mínimo y se desliza).
 */
const AdminTable = ({ headers, children }) => (
    <div className={styles.tableWrap}>
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
    </div>
);
export default AdminTable;