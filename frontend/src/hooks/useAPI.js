import {useState} from "react";


const useAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callAPI = async(url , options = {}) => {
        setLoading(true);
        setError(null);

        //Buscamos el token donde lo vamos a guardar, lo necesitamos porque usamos sanctum, lo guardamos en el localstorage.
        const token =  localStorage.getItem("token");
        //Preparamos las cabeceras.
        const headers = {
            "Content-Type":"application/json",
            "Accept":"application/json",
            ...options.headers,
        };

        //Si había ya token, se lo pegamos a las cabeceras.
        if(token){
            headers["Authorization"] = `Bearer ${token}`;
        }

        try{
            const response = await fetch(url, {
                headers,
                ...options,
            });

            if(!response.ok){
                if(response.status === 401){
                    //En este caso será porque la sesión se ha caducado por lo que forzaremos un cierre de sesión.
                }
                throw new Error("Error al realizar la petición a la API.");

            }

            const data = await response.json();
            return data;
        } catch (error){
            setError(error.message);
            throw error;
        } finally{
            setLoading(false);
        }
    }

    const getData = (url) => {
        return callAPI(url, {method:"GET"});
    }

    const deleteData = (url) => {
        return callAPI(url, {method:"DELETE"});
    }

    const save = (url, body) => {
        return callAPI(url, {method:"POST", body: JSON.stringify(body)});
    }

    const edit = (url, body) => {
        return callAPI(url, {method:"PUT", body: JSON.stringify(body)});
    }

    return {
        loading,
        error,
        getData,
        deleteData,
        save,
        edit
    }
};

export default useAPI;