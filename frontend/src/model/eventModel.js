"use strict";

export const eventIsValid = (event) => {
    if (!event) return false;
    return (
        isEventDateValid(event.event_date) &&
        isPriceValid(event.price) &&
        isMaxCapacityValid(event.max_capacity) &&
        isStatusValid(event.status_id)
    );
};

const isEventDateValid = (dateEvent) => !!dateEvent;

const isPriceValid = (price) => price === null || price === undefined || (!isNaN(price) && Number(price) >= 0);

const isMaxCapacityValid = (maxCapacity) => maxCapacity === null || maxCapacity === undefined || (!isNaN(maxCapacity) && Number(maxCapacity) >= 1);

const isStatusValid = (status) => status !== null && status !== undefined;
