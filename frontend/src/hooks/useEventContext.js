import { useContext } from "react";
import { EventContext } from "../context/EventProvider.jsx";

const useEventContext = () => {
    const context = useContext(EventContext);

    if (!context) {
        console.log('ERROR. You must use this data inside of EventProvider.');
    }

    return context;
}

export default useEventContext;