import { useState, useCallback, useRef } from 'react';
import MapView from './common/MapView.jsx';
import { searchPlaces } from '../utils/geocode.js';
import styles from './LocationInput.module.scss';

/**
 * Buscador de ubicación con autocompletado de OpenStreetMap (Nominatim) y
 * mini-mapa con Leaflet. Gratis, sin clave de API ni tarjeta.
 *
 * Pide sugerencias con debounce y, al elegir una, ya tiene las coordenadas
 * (Nominatim las devuelve) y pinta el mini-mapa. Devuelve al padre
 * {location, latitude, longitude}.
 *
 * @param {Object}   props
 * @param {Function} props.onLocationChange Callback con la ubicación elegida
 * @param {string}   [props.initialValue]   Texto inicial (al editar)
 * @param {number}   [props.initialLat]     Lat inicial (al editar)
 * @param {number}   [props.initialLng]     Lng inicial (al editar)
 */
const LocationInput = ({ onLocationChange, initialValue, initialLat, initialLng }) => {
    const [focused,     setFocused]     = useState(false);
    const [value,       setValue]       = useState(initialValue ?? '');
    const [suggestions, setSuggestions] = useState([]);
    const [coords,      setCoords]      = useState(
        initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : null
    );
    const debounceRef = useRef(null);

    const fetchSuggestions = useCallback(async (input) => {
        const results = await searchPlaces(input);
        setSuggestions(results);
    }, []);

    const handleChange = (e) => {
        const input = e.target.value;
        setValue(input);
        clearTimeout(debounceRef.current);
        // 400ms de debounce: Nominatim pide no abusar (1 req/s).
        debounceRef.current = setTimeout(() => fetchSuggestions(input), 400);
    };

    const handleSelect = (place) => {
        // Texto cortito y legible: las 3 primeras partes del nombre completo.
        const text = place.label.split(',').slice(0, 3).join(',').trim();
        setValue(text);
        setSuggestions([]);
        setCoords({ lat: place.lat, lng: place.lng });
        onLocationChange({ location: text, latitude: place.lat, longitude: place.lng });
    };

    const floating = focused || !!value;

    return (
        <div className={styles.wrapper}>
            <div className={styles.field}>
                <label className={`${styles.label} ${floating ? styles.floating : ''}`}>
                    Ubicación
                </label>
                <input
                    className={styles.input}
                    value={value}
                    placeholder={focused ? 'Ciudad, calle...' : ''}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={handleChange}
                />
            </div>

            {suggestions.length > 0 && (
                <ul className={styles.suggestions}>
                    {suggestions.map((s) => {
                        const parts     = s.label.split(',');
                        const main      = parts[0].trim();
                        const secondary = parts.slice(1, 3).join(',').trim();
                        return (
                            <li
                                key={s.id}
                                className={styles.suggestion}
                                onMouseDown={() => handleSelect(s)}
                            >
                                <strong>{main}</strong>
                                {secondary && <span> — {secondary}</span>}
                            </li>
                        );
                    })}
                </ul>
            )}

            {coords && (
                <MapView lat={coords.lat} lng={coords.lng} zoom={15} className={styles.map} />
            )}
        </div>
    );
};

export default LocationInput;
