import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";

const AdminRoute = () => {
    // Si 'loading' no existe en tu contexto, será undefined (falso)
    const { user, loading } = useAuthContext();
    
    // EL TRUCO: Miramos si hay un token guardado. 
    // OJO: Si vuestro token se llama diferente en el localStorage, cámbialo aquí.
    const hasToken = localStorage.getItem("token"); 

    let element = <div className="loading-screen">Verificando permisos...</div>;

    // 1. Si el contexto dice que carga OR si hay un token pero el usuario aún es null (está viajando)
    if (loading || (hasToken && user === null)) {
        element = <div className="loading-screen">Verificando permisos...</div>;
    } 
    // 2. Si ya llegó el usuario y es admin
    else if (user && user.role === "admin") {
        element = <Outlet />;   
    } 
    // 3. Si ya llegó el usuario pero NO es admin
    else if (user && user.role !== "admin") {
        element = <Navigate to="/" replace />;    
    } 
    // 4. Si no hay token y no hay usuario
    else {
        element = <Navigate to="/login" replace />;
    }

    return element;
}

export default AdminRoute;