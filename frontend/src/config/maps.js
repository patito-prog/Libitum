/**
 * Construye el enlace "Cómo llegar". Abre Google Maps (no necesita API key,
 * es una URL pública normal) con las coordenadas si las hay, o con el texto
 * de la dirección como búsqueda.
 */
export const mapsUrl = (lat, lng, location) =>
    lat && lng
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location ?? '')}`;
