import { useState, useEffect } from "react";
import useAPI from "./useAPI.js";
import useMessageContext from "./useMessageContext.js";

//No realizamos un contexto para proveer datos de admin ya que de esta manera estamos aplicando el patrón de separación de responsabilidades para que no haya acceso a datos privados en la aplicación ya que cuando salimos de los apartados admin
//React destruye el hook que hace todo el trabajo sucio y libera la memoria de todos esos datos. 
const useAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);

    const { loading, getData, deleteData } = useAPI(); 
    const { showMessageWithTime } = useMessageContext();


    const fetchUsers = async () => {
        try {
            const data = await getData("http://localhost:8000/api/admin/users");
            //De la api obtenemos un objeto complejo, los usuarios están en el campo data.
            setUsers(data.data || []);
        } catch (error) {
            showMessageWithTime("Error al cargar los usuarios.", "error");
        }
    };

    const fetchEvents = async () => {
        try {
            const data = await getData("http://localhost:8000/api/admin/events");
            setEvents(data.data || []);
        } catch (error) {
            showMessageWithTime("Error al cargar los eventos.", "error");
        }
    };

    const deleteUser = async (id) => {
        //Hacer un confirm a mano.
        if (!window.confirm("¿Seguro que quieres eliminar a este usuario?")) return;
        try {
            await deleteData(`http://localhost:8000/api/admin/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            showMessageWithTime("Usuario eliminado.", "ok");
        } catch (err) {
            showMessageWithTime("No se pudo eliminar el usuario.", "error");
        }
    };

    const deleteEvent = async (id) => {
        //Hacer el confirm a mano.
        if (!window.confirm("¿Seguro que quieres borrar este evento?")) return;
        try {
            await deleteData(`http://localhost:8000/api/admin/events/${id}`);
            setEvents(events.filter(event => event.id !== id));
            showMessageWithTime("Evento eliminado.", "ok");
        } catch (err) {
            showMessageWithTime("No se pudo eliminar el evento.", "error");
        }
    };

    // Solo pide datos si el array está vacío, para no estar cargando datos cada vez que se cambie la pestaña.
    useEffect(() => {
        if (activeTab === "users" && users.length === 0) {
            fetchUsers();
        } else if (activeTab === "events" && events.length === 0) {
            fetchEvents();
        }
    }, [activeTab]); 
   
    return {
        activeTab,
        setActiveTab,
        users,
        events,
        loading,
        deleteUser,
        deleteEvent
    };
};

export default useAdminDashboard;