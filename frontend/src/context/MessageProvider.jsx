import React, { createContext, useState, useRef } from "react";
import {isNumber} from '../utils/validations/index.js';

/**
 * Contexto de mensajes (toasts).
 *
 * Centraliza el aviso flotante de la app: el texto, su tipo (ok/error/info/
 * warning, que decide el color) y una barra de progreso para autocerrarlo.
 * Cualquier parte de la app lanza un toast con `showMessageWithTime(...)`.
 */
const messageContext = createContext();

const MessageProvider = ({ children }) => {
	const [message, setMessage] = useState("");

	// JS no tiene enums, así que simulamos uno con un objeto para los tipos de mensaje.
	const MESSAGE_TYPE = {
		OK: "OK",
		ERROR: "ERROR",
		INFO: "INFO",
		WARNING: "WARNING",
	};

	const [messageType, setMessageType] = useState(MESSAGE_TYPE.INFO); // controla el color/estilo
	const [activeMessage, setActiveMessage] = useState(false);          // ¿se ve el toast?
	const [timeMessageProgress, setTimeMessageProgress] = useState();   // ms restantes (barra de progreso)
	const [messageDuration, setMessageDuration] = useState(5000);       // duración total (para la barra)
	const intervalRef = useRef(null);

	/**
	 * Muestra un mensaje. El tipo es opcional (por defecto INFO) y solo afecta
	 * al estilo visual.
	 * @param {string} newMessage Texto a mostrar
	 * @param {string} [type="info"] ok | error | warning | info
	 */
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

	/** Oculta el toast y resetea su estado. */
	const hideMessage = () => {
		setMessage("");
		setMessageType(MESSAGE_TYPE.INFO);
		setActiveMessage(false);
	};

	/**
	 * Muestra un mensaje que se autocierra. Lleva una barra de progreso que va
	 * descontando de 10 en 10 ms hasta llegar a 0, momento en el que se oculta.
	 *
	 * @param {string} newMessage Texto
	 * @param {string} [type="info"] Tipo (estilo)
	 * @param {number} [milisecs=3000] Cuánto dura visible
	 */
	const showMessageWithTime = (newMessage, type = "info", milisecs = 5000) => {
		if(!isNumber(milisecs)) throw Error("ShowMessageTime-MessageProvider: The param of milisecs have to be a number");
		// Si ya había un toast contando, cancelamos su intervalo antes de empezar otro.
		if (intervalRef.current) clearInterval(intervalRef.current);
		setMessageDuration(milisecs);
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
		messageDuration,
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
