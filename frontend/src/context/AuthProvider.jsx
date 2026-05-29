import {createContext, useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import useAPI from "../hooks/useAPI.js";
import API_BASE from "../config/api.js";

/**
 * Contexto de autenticación.
 *
 * Lleva el control de quién está logueado en toda la app: guarda el usuario y
 * el token de Sanctum, expone login/logout/registro y un par de atajos (hasRole,
 * isAdmin). El token se persiste en localStorage para que la sesión sobreviva
 * a recargas; al arrancar se valida pidiendo /api/user.
 */
const authContext = createContext();

const AuthProvider = ({children}) => {

    const nav = useNavigate();
    const {getData, save} = useAPI();

    const [user, setUser] = useState(null);                                  // Datos del usuario logueado
    const [token, setToken] = useState(localStorage.getItem("token") || null); // Token Sanctum (persistido)
    const [isAuthenticated, setIsAutheticated] = useState(false);            // ¿Sesión válida?
    const [loadingAuth, setLoadingAuth] = useState(true);                    // ¿Aún comprobando la sesión inicial?

    const pathGetUser  = `${API_BASE}/api/user`;
    const pathLogin    = `${API_BASE}/api/login`;
    const pathRegister = `${API_BASE}/api/register`;
    const pathLogOut   = `${API_BASE}/api/logout`;
    const pathResend   = `${API_BASE}/api/email/resend`;

    /**
     * Inicia sesión. Guarda el token; el cambio de `token` dispara el useEffect
     * de abajo, que ya se encarga de traer el usuario y marcar la sesión.
     * Si las credenciales fallan, el error sube al Login.jsx para mostrar el aviso.
     *
     * @param {{email:string, password:string}} credentials
     */
    const logIn = async (credentials) => {
        const response = await save(pathLogin, credentials);
        const newToken = response.token;

        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    /**
     * Registra un usuario nuevo. Ya NO lo loguea ni redirige: el back manda un
     * correo de verificación y devuelve { needs_verification, email }. Devolvemos
     * esa respuesta para que el Register muestre la pantalla de "revisa tu correo".
     * @param {Object} userData Datos del formulario de registro
     * @returns {Promise<Object>} respuesta del back
     */
    const register = async (userData) => {
        return await save(pathRegister, userData);
    };

    /**
     * Reenvía el correo de verificación a una dirección dada.
     * @param {string} email
     */
    const resendVerification = async (email) => {
        return await save(pathResend, { email });
    };

    /**
     * Comprueba si el usuario actual tiene un rol concreto.
     * @param {string} roleName 'admin' | 'artist' | 'spectator'
     * @returns {boolean}
     */
    const hasRole = (roleName) => {
        if (!user || !user.role) return false;
        return user.role === roleName;
    };

    // Atajo para saber si es admin. No lo guardamos como estado a propósito:
    // depende de `user`, así que se recalcula solo cuando user cambia y evitamos
    // tener dos estados que mantener sincronizados.
    const isAdmin = hasRole("admin");

    /**
     * Vuelve a pedir los datos del usuario al back (p.ej. tras editar el perfil).
     * Si falla, lo dejamos como está sin romper nada.
     */
    const refreshUser = async () => {
        try {
            const response = await getData(pathGetUser);
            if (!response.error) setUser(response.data);
        } catch {
            /* silencioso: si falla, mantenemos el usuario actual */
        }
    };

    /**
     * Cierra sesión. Avisa al back para invalidar el token y, pase lo que pase,
     * limpia el estado local y manda al login (por eso va en el finally).
     */
    const logOut = async () => {
        try{
            await save(pathLogOut, {});
        } finally {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setIsAutheticated(null);
            nav("/login");
        }
    };

    // Comprobación de sesión al arrancar (y cada vez que cambia el token).
    // Si hay token, validamos contra /api/user: si va bien marcamos sesión activa,
    // si no, cerramos. Sin token, simplemente no hay sesión.
    useEffect(() => {
        const checkUser = async () => {
            if(token) {
                try{
                    const response = await getData(pathGetUser);
                    if(!response.error) {
                        setUser(response.data);
                        setIsAutheticated(true);
                    }else{
                        logOut();
                    }
                }catch{
                    logOut();
                }
            }else{
                setIsAutheticated(false);
                setUser(null);
            }
            // Pase lo que pase, ya hemos terminado de comprobar: quitamos el "cargando".
            setLoadingAuth(false);
        }

        checkUser();
    }, [token]);

    const dataProvider = {
        user,
        token,
        isAuthenticated,
        loadingAuth,
        isAdmin,
        logIn,
        logOut,
        register,
        resendVerification,
        hasRole,
        refreshUser
    };

    return(
        <authContext.Provider value={dataProvider}>{children}</authContext.Provider>
    );
}
export default AuthProvider;
export {authContext}
