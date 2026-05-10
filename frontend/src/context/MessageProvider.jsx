import React, { createContext, useState, useRef } from "react";
import {isNumber} from '../utils/validations/index.js';

const messageContext = createContext();

const MessageProvider = ({ children }) => {
	const [message, setMessage] = useState("");
	// Se me ha ocurrido probar con enum para saber que tipo de mensaje es ya que es un tipo de dato que no manejo bien.
	//He visto que en JS no existen los enum como tal, pero se puede simular.
	const MESSAGE_TYPE = {
		OK: "OK",
		ERROR: "ERROR",
		INFO: "INFO",
		WARNING: "WARNING",
	};
	// Se utilizaría de manera opcional para el diseño del mensaje.
	const [messageType, setMessageType] = useState(MESSAGE_TYPE.INFO);
	const [activeMessage, setActiveMessage] = useState(false);
	const [timeMessageProgress, setTimeMessageProgress] = useState()
	const intervalRef = useRef(null);

	//Como es opcional la función de añadir un tipo de mensaje, por defecto sera INFO.
	const showMessage = (newMessage, type = "info") => {
		setMessage(newMessage);
		switch (type.toLowerCase()) {
			case "ok":
				setMessageType(MESSAGE_TYPE.OK);
				break;
			case "error":
				setMessageType(MESSAGE_TYPE.ERROR);
				break;
			case "warning":
				setMessageType(MESSAGE_TYPE.WARNING);
				break;
			default:
				setMessageType(MESSAGE_TYPE.INFO);
		}
		setActiveMessage(true);
	};

	const hideMessage = () => {
		setMessage("");
		setMessageType(MESSAGE_TYPE.INFO);
		setActiveMessage(false);
	};

	const showMessageWithTime = (newMessage, type = "info", milisecs = 3000) => {
		if(!isNumber(milisecs)) throw Error("ShowMessageTime-MessageProvider: The param of milisecs have to be a number");
		// Cancelar intervalo anterior si había uno activo.
		if (intervalRef.current) clearInterval(intervalRef.current);
		setTimeMessageProgress(milisecs);
		showMessage(newMessage, type);
		intervalRef.current = setInterval(() => {
			setTimeMessageProgress(num => {
				if (num <= 0) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
					// setTimeout evita actualizar estado mientras React aún está renderizando.
					setTimeout(() => hideMessage(), 10);
					return 0;
				}
				return num - 10;
			});
		}, 10);
	}

	const actions = {
		message,
		messageType,
		activeMessage,
		timeMessageProgress,
		showMessage,
		hideMessage,
		showMessageWithTime
	};
	return (
		<messageContext.Provider value={actions}>
			{children}
		</messageContext.Provider>
	);
};

export default MessageProvider;
export { messageContext };
