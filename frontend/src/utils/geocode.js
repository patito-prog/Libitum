/**
 * Búsqueda de direcciones con Nominatim (el geocoder gratuito de OpenStreetMap).
 * No necesita clave ni tarjeta. Usamos fetch "pelado" a propósito (NO el hook
 * useAPI) para no mandarle nuestro token de sesión a un servicio externo.
 *
 * @param {string} query Texto a buscar
 * @returns {Promise<Array<{id:number, lat:number, lng:number, label:string}>>}
 */
export const searchPlaces = async (query) => {
    if (!query || query.trim().length < 2) return [];

    const url = 'https://nominatim.openstreetmap.org/search'
        + `?format=jsonv2&addressdetails=1&limit=5&accept-language=es&q=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(p => ({
            id:    p.place_id,
            lat:   parseFloat(p.lat),
            lng:   parseFloat(p.lon),
            label: p.display_name,
        }));
    } catch {
        return [];
    }
};
