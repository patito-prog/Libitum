import React, { createContext, useState } from "react";

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

	const actions = {
		message,
		messageType,
		activeMessage,
		showMessage,
		hideMessage,
	};
	return (
		<messageContext.Provider value={actions}>
			{children}
		</messageContext.Provider>
	);
};

export default MessageProvider;
export { messageContext };
