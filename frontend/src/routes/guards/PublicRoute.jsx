import {Navigate, Outlet} from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";
import Loading from "../../components/common/Loading.jsx";

const PublicRoute = () => {
    const {isAuthenticated, loadingAuth} = useAuthContext();
    let content;

    if(loadingAuth){
        content = <Loading fullScreen />;
    } else {
        if(isAuthenticated){
            content = <Navigate to="/" replace />;
        } else {
            content = <Outlet/>
        }
    }

    return content;
}

export default PublicRoute;
