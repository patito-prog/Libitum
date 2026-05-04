import {Navigate, Outlet} from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";

const PublicRoute = () => {
    const {isAutheticated, loadingAuth} = useAuthecontext();
    let content;

    if(loadingAuth){
        content = <div className="loading-screen">Cargando...</div>;
    } else {
        if(!isAutheticated){
            content = <Navigate to="/login" replace />;
        }else{
            content = <Outlet/>
        }
    }
}

export default PublicRoute;