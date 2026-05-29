import {useState} from "react";

/**
 * Hook central de llamadas a la API.
 *
 * Envuelve `fetch` para no repetir en cada componente lo mismo: meter el token
 * de Sanctum, las cabeceras JSON, parsear la respuesta y gestionar errores.
 * Expone helpers por verbo HTTP (getData, save, edit, patch, deleteData,
 * uploadFile) más los flags `loading` y `error`.
 *
 * @returns {{
 *   loading: boolean, error: string|null,
 *   getData: Function, deleteData: Function, save: Function,
 *   edit: Function, patch: Function, uploadFile: Function
 * }}
 */
const useAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Núcleo de la petición. Todos los helpers acaban llamando aquí.
     *
     * @param {string} url     URL completa del endpoint
     * @param {Object} options Opciones de fetch (method, body, headers...)
     * @returns {Promise<Object>} El JSON de la respuesta
     * @throws {Error} con el mensaje del back si la respuesta no es ok
     */
    const callAPI = async(url , options = {}) => {
        setLoading(true);
        setError(null);

        // Token guardado en localStorage (usamos Sanctum con tokens, no cookies).
        const token = localStorage.getItem("token");

        // Si el body es FormData (subida de ficheros) NO ponemos Content-Type:
        // el navegador lo pone solo con el boundary correcto.
        const isFormData = options.body instanceof FormData;
        const headers = {
            "Accept": "application/json",
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...options.headers,
        };

        // Si hay token, lo mandamos como Bearer.
        if(token){
            headers["Authorization"] = `Bearer ${token}`;
        }

        try{
            const response = await fetch(url, {
                headers,
                ...options,
            });

            if(!response.ok){
                // Mensaje del back si lo trae; si no, uno amigable según el código.
                // Así nunca enseñamos cosas técnicas tipo "HTTP 500" al usuario.
                const errorBody = await response.json().catch(() => null);
                const message = errorBody?.message ?? friendlyByStatus(response.status);
                // Adjuntamos el cuerpo y el status al error para que el componente
                // pueda reaccionar a casos concretos (p.ej. needs_verification).
                const err = new Error(message);
                err.body = errorBody;
                err.status = response.status;
                throw err;
            }
            return await response.json();
        } catch (error){
            // Si es un error nuestro (con status), ya lleva mensaje amigable.
            // Si no (fallo de red: fetch lanza TypeError), lo traducimos.
            if (!error.status) {
                const netErr = new Error("No se ha podido conectar. Revisa tu conexión e inténtalo de nuevo.");
                netErr.isNetwork = true;
                setError(netErr.message);
                throw netErr;
            }
            setError(error.message);
            throw error; // lo relanzamos para que el componente decida qué hacer
        } finally{
            setLoading(false);
        }
    }

    /** Mensaje amigable en español según el código HTTP cuando el back no manda uno. */
    const friendlyByStatus = (status) => {
        switch (status) {
            case 401: return "Tu sesión no es válida. Vuelve a iniciar sesión.";
            case 403: return "No tienes permiso para hacer esto.";
            case 404: return "No hemos encontrado lo que buscabas.";
            case 422: return "Revisa los datos del formulario.";
            case 429: return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
            default:  return status >= 500
                ? "Ha ocurrido un error en el servidor. Inténtalo más tarde."
                : "Algo ha ido mal. Inténtalo de nuevo.";
        }
    };

    /** GET. @param {string} url @returns {Promise<Object>} */
    const getData = (url) => callAPI(url, {method:"GET"});

    /** DELETE. @param {string} url @returns {Promise<Object>} */
    const deleteData = (url) => callAPI(url, {method:"DELETE"});

    /** POST con body JSON. @param {string} url @param {Object} body */
    const save = (url, body) => callAPI(url, {method:"POST", body: JSON.stringify(body)});

    /** PUT con body JSON. @param {string} url @param {Object} body */
    const edit = (url, body) => callAPI(url, {method:"PUT", body: JSON.stringify(body)});

    /** PATCH con body JSON. @param {string} url @param {Object} body */
    const patch = (url, body) => callAPI(url, {method:"PATCH", body: JSON.stringify(body)});

    /** POST multipart para subir ficheros. @param {string} url @param {FormData} formData */
    const uploadFile = (url, formData) => callAPI(url, { method: 'POST', body: formData });

    return {
        loading,
        error,
        getData,
        deleteData,
        save,
        edit,
        patch,
        uploadFile
    }
};

export default useAPI;
