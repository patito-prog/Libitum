import { useState, useEffect, useCallback } from "react";
import useAPI from "./useAPI.js";
import useMessageContext from "./useMessageContext.js";
import API_BASE from "../config/api.js";

const useAdminDashboard = () => {
    const [activeTab, setActiveTab]   = useState("users");
    const [users, setUsers]           = useState([]);
    const [events, setEvents]         = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [userPage, setUserPage]     = useState(1);
    const [usersMeta, setUsersMeta]   = useState({ currentPage: 1, lastPage: 1, total: 0 });
    const [eventsLoaded, setEventsLoaded] = useState(false);

    const { loading, getData, deleteData, patch } = useAPI();
    const { showMessageWithTime } = useMessageContext();

    const fetchUsers = useCallback(async (page = 1, search = "") => {
        try {
            const params = new URLSearchParams({ page });
            if (search) params.set("search", search);
            const data = await getData(`${API_BASE}/api/admin/users?${params}`);
            const paginator = data.data;
            setUsers(paginator.data || []);
            setUsersMeta({
                currentPage: paginator.current_page,
                lastPage:    paginator.last_page,
                total:       paginator.total,
            });
        } catch {
            showMessageWithTime("Error al cargar los usuarios.", "error");
        }
    }, [getData, showMessageWithTime]);

    const fetchEvents = useCallback(async () => {
        try {
            const data = await getData(`${API_BASE}/api/admin/events`);
            setEvents(data.data || []);
            setEventsLoaded(true);
        } catch {
            showMessageWithTime("Error al cargar los eventos.", "error");
        }
    }, [getData, showMessageWithTime]);

    // Carga inicial de usuarios
    useEffect(() => {
        if (activeTab === "users") fetchUsers(userPage, userSearch);
    }, [activeTab]);

    // Recarga cuando cambia la búsqueda (con reset de página)
    useEffect(() => {
        if (activeTab !== "users") return;
        const timer = setTimeout(() => {
            setUserPage(1);
            fetchUsers(1, userSearch);
        }, 350);
        return () => clearTimeout(timer);
    }, [userSearch]);

    // Recarga cuando cambia la página
    useEffect(() => {
        if (activeTab !== "users") return;
        fetchUsers(userPage, userSearch);
    }, [userPage]);

    // Carga eventos solo al entrar en la pestaña (y solo una vez)
    useEffect(() => {
        if (activeTab === "events" && !eventsLoaded) fetchEvents();
    }, [activeTab]);

    const deleteUser = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar a este usuario?")) return;
        try {
            await deleteData(`${API_BASE}/api/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            setUsersMeta(prev => ({ ...prev, total: prev.total - 1 }));
            showMessageWithTime("Usuario eliminado.", "ok");
        } catch {
            showMessageWithTime("No se pudo eliminar el usuario.", "error");
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm("¿Seguro que quieres borrar este evento?")) return;
        try {
            await deleteData(`${API_BASE}/api/admin/events/${id}`);
            setEvents(prev => prev.filter(e => e.id !== id));
            showMessageWithTime("Evento eliminado.", "ok");
        } catch {
            showMessageWithTime("No se pudo eliminar el evento.", "error");
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const res = await patch(`${API_BASE}/api/admin/users/${userId}`, { role: newRole });
            const updated = res.data?.user;
            if (updated) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
            }
            showMessageWithTime("Rol actualizado.", "ok");
        } catch {
            showMessageWithTime("No se pudo cambiar el rol.", "error");
        }
    };

    return {
        activeTab, setActiveTab,
        users, events, loading,
        userSearch, setUserSearch,
        userPage, setUserPage, usersMeta,
        deleteUser, deleteEvent, updateUserRole,
    };
};

export default useAdminDashboard;
