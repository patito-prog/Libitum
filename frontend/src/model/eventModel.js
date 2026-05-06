"use strict";


/**
 * Function to validate if an event object has all required fields valids.
 * @param {*} event 
 * @returns { boolean } 
 */
export const eventIsValid = (event) => {
    let isEventValid = true;
    if (!event) isEventValid = false;
    if (!isTitleValid(event.title)) isEventValid = false;
    if (!isDescriptionValid(event.description)) isEventValid = false;
    if (!isLocationValid(event.location)) isEventValid = false;
    if (!isEventDateValid(event.event_date)) isEventValid = false;
    if (!isPriceValid(event.price)) isEventValid = false;
    if (!isCoverImageValid(event.cover_image)) isEventValid = false;
    if (!isMaxCapacityValid(event.max_capacity)) isEventValid = false;
    if (!isStatusValid(event.status_id)) isEventValid = false;
    return isEventValid;
}

const isTitleValid = (title) => {
    console.log("Funcion validar titulo no programada");
}

const isDescriptionValid = (description) => {
    console.log("Funcion validar descripcion no programada");
}

const isLocationValid = (location) => {
    console.log("Funcion validar localizacion no programada");
}

const isEventDateValid = (dateEvent) => {
    console.log("Funcion validar fecha del evento no programada");
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