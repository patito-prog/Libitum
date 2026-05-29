export const MAPS_LIBRARIES = ['places', 'marker'];
export const MAPS_OPTIONS = { disableDefaultUI: true, zoomControl: true, mapId: 'DEMO_MAP_ID' };
export const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

export const mapsUrl = (lat, lng, location) =>
    lat && lng
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location ?? '')}`;
