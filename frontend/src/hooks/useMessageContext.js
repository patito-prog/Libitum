import React, {useContext} from "react";
import {messageContext} from "../context/MessageProvider.jsx";

/**
 * Atajo para consumir el contexto de mensajes/toasts.
 * Lanza error si se usa fuera del MessageProvider.
 * @returns el valor del messageContext (showMessageWithTime...)
 */
const useMessageContext = () =>{
    const context = useContext(messageContext);

    if(!context){
        throw new Error("Para utilizar useMessage debe estar el componente englobado por el contexto MessageProvider");
    }

    return context
};

export default useMessageContext;