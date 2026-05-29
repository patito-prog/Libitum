"use strict";

/* Utilidades compartidas: etiquetas legibles, formato de fecha y helpers. */

/** Traducción de los estados internos de evento a texto para el usuario. */
export const STATUS_LABELS = {
    draft:     'Borrador',
    published: 'Publicado',
    live:      'En directo',
    finished:  'Terminado',
    cancelled: 'Cancelado',
};

/** Traducción de los roles a texto para el usuario. */
export const ROLE_LABELS = {
    artist:    'Artista',
    spectator: 'Espectador',
    user:      'Espectador',
    admin:     'Admin',
};

/** ¿El valor es un número? (envoltura legible de !isNaN). */
export const isNumber = (num) => !isNaN(num);

/**
 * Devuelve el estado EFECTIVO de un evento.
 * Prioriza el campo calculado por el back (effective_status_name, que tiene en
 * cuenta la fecha real) sobre el estado guardado en BD.
 * @param {Object} event
 * @returns {string} nombre del estado o '' si no hay
 */
export const getStatusName = (event) =>
    event?.effective_status_name ?? event?.status?.name ?? '';

/**
 * Formatea una fecha ISO a algo legible en español (ej. "23 oct 2026, 20:00").
 * @param {string} iso
 * @returns {string}
 */
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