"use strict";

export const isNumber = (num) => {
    //isNotaNumber? = true;
    return !isNaN(num);
}

export const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};