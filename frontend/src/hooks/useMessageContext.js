import React, {useContext} from "react";
import {messageContext} from "../context/MessageProvider.jsx";

const useMessageContext = () =>{
    const context = useContext(messageContext);

    if(!context){
        throw new Error("Para utilizar useMessage debe estar el componente englobado por el contexto MessageProvider");
    }

    return context
};

export default useMessageContext;