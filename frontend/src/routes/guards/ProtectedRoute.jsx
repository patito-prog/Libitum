import {Navigate, Outlet} from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";

const ProtectedRoute = () => {
    const {isAuthenticated, loadingAuth} = useAuthContext();
    let content;

    if(loadingAuth){
        content = <div className="loading-screen">Cargando...</div>
    } else {
        if(!isAuthenticated){
            content = <Navigate to="/login" replace/>;
        } else {
            content = <Outlet/>
        }
    }

    return content;
}

export default ProtectedRoute;
