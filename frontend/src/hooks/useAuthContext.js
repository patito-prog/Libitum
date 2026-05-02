import {useContext} from "react";
import { authContext } from "../context/AuthProvider.jsx";

const useAuthContext = () => {
    const context = useContext(authContext);
    if(!context) {
        throw new Error("Debes utilizar useAuth dentro del contexto AuthProvider.");

    }

    return context;
};

export default useAuthContext;