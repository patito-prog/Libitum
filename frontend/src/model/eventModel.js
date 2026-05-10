"use strict";


/**
 * Function to validate if an event object has all required fields valids.
 * @param {*} event 
 * @returns { boolean } 
 */
export const eventIsValid = (event) => {
    let isEventValid = true;
    if (!event) isEventValid = false;
    if (!isEventDateValid(event.event_date)) isEventValid = false;
    if (!isPriceValid(event.price)) isEventValid = false;
    if (!isCoverImageValid(event.cover_image)) isEventValid = false;
    if (!isMaxCapacityValid(event.max_capacity)) isEventValid = false;
    if (!isStatusValid(event.status_id)) isEventValid = false;
    return isEventValid;
}

const isEventDateValid = (dateEvent) => {
    
}

const isPriceValid = (price) => {
    console.log("Funcion validar precio no programada");
}

const isCoverImageValid = (coverImage) => {
    console.log("Funcion validar cover image no programada");
}

const isMaxCapacityValid = (maxCapacity) => {
    console.log("Funcion validar capacidad maxima no programada");
}

const isStatusValid = (status) => {
    console.log("Funcion validar status no programada");
}