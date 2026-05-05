import {Navigate, Outlet} from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";

const ProtectedRoute = () => {
    const {isAutheniticated, loadingAuth} = useAuthContext();
    let content;

    if(loadingAuth){
        //se cargaría el componente de cargando cuando se haga.
         content = <div className="loading-screen">Cargando...</div>
    } else {
        if(!isAutheniticated){
            constent = <Navigate to="/login" replace/>;
        } else {
            content = <Outlet/>
        }
    }

    return content;
}

export default ProtectedRoute;