import {useContext} from "react";
import { authContext } from "../context/AuthProvider.jsx";

/**
 * Atajo para consumir el contexto de autenticación.
 * Lanza error si se usa fuera del AuthProvider (así cazamos el fallo en dev).
 * @returns el valor del authContext (user, token, logIn, logOut, isAdmin...)
 */
const useAuthContext = () => {
    const context = useContext(authContext);
    if(!context) {
        throw new Error("Debes utilizar useAuth dentro del contexto AuthProvider.");

    }

    return context;
};

export default useAuthContext;