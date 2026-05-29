import {Navigate, Outlet} from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext.js";
import Loading from "../../components/common/Loading.jsx";

const ProtectedRoute = () => {
    const {isAuthenticated, loadingAuth} = useAuthContext();
    let content;

    if(loadingAuth){
        content = <Loading fullScreen />
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
