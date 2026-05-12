import React from "react";
import useMessageContext from "../../hooks/useMessageContext.js";
import styles from "./MessageApp.module.scss";

const MensajeApp = () => {
	const { message, messageType, activeMessage } = useMessageContext();

	return (
		activeMessage && (
			<div className={`messageApp_container ${messageType.toLowerCase()}`}>
				<p>{message}</p>
			</div>
		)
	);
};

export default MensajeApp;
