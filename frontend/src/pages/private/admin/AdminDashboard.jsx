import useAdminDashboard from "../../../hooks/useAdminDashboard.js";
import AdminTable from "../../../components/admin/AdminTable.jsx";
import UserRow from "../../../components/admin/UserRow.jsx";
import EventRow from "../../../components/admin/EventRow.jsx";
import styles from "../../../components/admin/Admin.module.scss";

const AdminDashboard = () => {
    const {
        activeTab, setActiveTab,
        users, events, loading,
        userSearch, setUserSearch,
        userPage, setUserPage, usersMeta,
        deleteUser, deleteEvent, updateUserRole,
    } = useAdminDashboard();

    return (
        <div className={styles.adminDashboardContainer}>
            <h1>Panel de Control</h1>

            <div className={styles.tabs}>
                <button onClick={() => setActiveTab("users")}  className={activeTab === "users"  ? styles.active : ""}>
                    Usuarios {activeTab === "users" && usersMeta.total > 0 && `(${usersMeta.total})`}
                </button>
                <button onClick={() => setActiveTab("events")} className={activeTab === "events" ? styles.active : ""}>
                    Eventos
                </button>
            </div>

            {activeTab === "users" && (
                <div className={styles.toolBar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                    />
                </div>
            )}

            <div className="content">
                {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                ) : activeTab === "users" ? (
                    <>
                        <AdminTable headers={["ID", "Nombre", "Email", "Rol", "Acciones"]}>
                            {users.map(user => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onDelete={deleteUser}
                                    onRoleChange={updateUserRole}
                                />
                            ))}
                        </AdminTable>

                        {usersMeta.lastPage > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setUserPage(p => p - 1)}
                                    disabled={usersMeta.currentPage <= 1}
                                >
                                    ← Anterior
                                </button>
                                <span className={styles.pageInfo}>
                                    {usersMeta.currentPage} / {usersMeta.lastPage}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setUserPage(p => p + 1)}
                                    disabled={usersMeta.currentPage >= usersMeta.lastPage}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <AdminTable headers={["ID", "Título", "Artista", "Fecha", "Estado", "Asistentes", "Acciones"]}>
                        {events.map(event => (
                            <EventRow key={event.id} event={event} onDelete={deleteEvent} />
                        ))}
                    </AdminTable>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
