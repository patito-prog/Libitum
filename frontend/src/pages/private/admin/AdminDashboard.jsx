import useAdminDashboard from "../../../hooks/useAdminDashboard.js";
import AdminTable from "../../../components/admin/AdminTable.jsx";
import UserRow from "../../../components/admin/UserRow.jsx";
import EventRow from "../../../components/admin/EventRow.jsx";
// Ajusta esta ruta a donde guardaste el SCSS
import styles from "../../../components/admin/Admin.module.scss"; 

const AdminDashboard = () => {
    const { activeTab, setActiveTab, users, events, loading, deleteUser, deleteEvent } = useAdminDashboard();

    return (
        <div className={styles.adminDashboardContainer}>
            <h1>Panel de Control</h1>
            
            <div className={styles.tabs}>
                <button 
                    onClick={() => setActiveTab("users")} 
                    className={activeTab === "users" ? styles.active : ""}
                >
                    Usuarios
                </button>
                <button 
                    onClick={() => setActiveTab("events")} 
                    className={activeTab === "events" ? styles.active : ""}
                >
                    Eventos
                </button>
            </div>

            <div className="content">
                {loading ? <p>Cargando...</p> : (
                    activeTab === "users" ? (
                        <AdminTable headers={["ID", "Nombre", "Email", "Rol", "Acciones"]}>
                            {users.map(user => (
                                <UserRow key={user.id} user={user} onDelete={deleteUser} />
                            ))}
                        </AdminTable>
                    ) : (
                        <AdminTable headers={["ID", "Título", "Fecha", "Acciones"]}>
                            {events.map(event => (
                                <EventRow key={event.id} event={event} onDelete={deleteEvent} />
                            ))}
                        </AdminTable>
                    )
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;