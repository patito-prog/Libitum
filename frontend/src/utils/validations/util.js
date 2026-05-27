"use strict";

export const STATUS_LABELS = {
    draft:     'Borrador',
    published: 'Publicado',
    live:      'En directo',
    finished:  'Terminado',
    cancelled: 'Cancelado',
};

export const ROLE_LABELS = {
    artist:    'Artista',
    spectator: 'Espectador',
    user:      'Espectador',
    admin:     'Admin',
};

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