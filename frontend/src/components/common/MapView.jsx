import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Vite no resuelve solo las imágenes del marcador por defecto de Leaflet, así
// que las importamos a mano y construimos el icono. Sin esto, el marcador no
// se ve.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const markerDefault = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

/**
 * Mini-mapa con OpenStreetMap (gratis, sin clave de API ni tarjeta).
 *
 * Se puede arrastrar y hacer zoom con los botones +/−, pero el scroll de la
 * rueda NO hace zoom (scrollWheelZoom=false) para no secuestrar el scroll de
 * la página. Al cambiar las coordenadas, remontamos el mapa con `key` para
 * que se recentre.
 *
 * Con `interactive={false}` el mapa queda como una imagen fija (no se arrastra
 * ni hace zoom): ideal para el feed, donde tocar el mapa molestaba al hacer
 * scroll (sobre todo en móvil).
 *
 * @param {{ lat:number, lng:number, zoom?:number, className?:string, interactive?:boolean }} props
 */
const MapView = ({ lat, lng, zoom = 15, className, interactive = true }) => {
    if (lat == null || lng == null) return null;

    return (
        <MapContainer
            key={`${lat},${lng}`}
            center={[lat, lng]}
            zoom={zoom}
            scrollWheelZoom={false}
            dragging={interactive}
            touchZoom={interactive}
            doubleClickZoom={interactive}
            boxZoom={interactive}
            keyboard={interactive}
            zoomControl={interactive}
            className={className}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={markerDefault} />
        </MapContainer>
    );
};

export default MapView;
