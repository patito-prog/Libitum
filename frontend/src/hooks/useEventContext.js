import { useContext } from "react";
import { EventContext } from "../providers/EventProvider.jsx";

const useEventContext = () => {
    const context = useContext(EventContext);

    if (!context) {
        throw Error('ERROR. You must use this data inside of EventProvider.');
    }

    return context;
}

export default useEventContext;