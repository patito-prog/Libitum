import React, {createContext, useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import useAPI from "../hooks/useAPI.js";

const authContext = createContext();

const AuthProvider = ({children}) => {

    const nav = useNavigate();
    const {getData, save} = useAPI();

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [isAuthenticated, setIsAutheticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const pathGetUser = "http://localhost:8000/api/user";
    const pathLogin = "http://localhost:8000/api/login";
    const pathRegister = "http://localhost:8000/api/register";
    const pathLogOut = "http://localhost:8000/api/logout";

    const logIn = async (credentials) => {
        //Validaciones realizadas en Login.jsx.
        try{
            const response = await save(pathLogin, credentials);
            const newToken = response.token;

            localStorage.setItem("token", newToken);
            setToken(newToken);
            //nav("/..."); debe navegar a la página donde se muestra el "for you" modo insta de los artistas a los que sigues.
        }catch(error){
            throw error;
        }
    };

    const register = async (userData) => {
        try{
            await save(pathRegister, userData);
            nav("/login");
        }catch (error){
            throw error;
        }
    };

    const logOut = async () => {
        try{
            await save(pathLogOut, {});
        }catch(error){
            throw error;
        }finally{
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setIsAutheticated(null);
            nav("/login");
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            if(token) {
                try{
                    const response = await getData(pathGetUser);
                    if(!response.error) {
                        setUser(response.data);
                        setIsAutheticated(true);
                        //navegar al "para tí" del usuario.
                    }else{
                        logOut();
                    }
                }catch(error){
                    logOut();
                }
                
            }else{
                setIsAutheticated(false);
                setUser(null);
            }
            setLoadingAuth(false);
        }

        checkUser();
        
    }, [token]);

    const dataProvider = {
        user,
        token,
        isAuthenticated,
        loadingAuth,
        logIn,
        logOut,
        register
    };

    return(
        <authContext.Provider value={dataProvider}>{children}</authContext.Provider>
    );
}
export default AuthProvider;
export {authContext}