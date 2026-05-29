import { useEffect, useState, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, useGoogleMap } from '@react-google-maps/api';
import styles from './LocationInput.module.scss';
import { MAPS_LIBRARIES, MAPS_OPTIONS, MAPS_KEY } from '../config/googleMaps.js';

// AdvancedMarker — debe renderizarse dentro de <GoogleMap>
const AdvancedMarker = ({ position }) => {
    const map = useGoogleMap();

    useEffect(() => {
        if (!map) return;
        const MarkerEl = window.google?.maps?.marker?.AdvancedMarkerElement;
        if (!MarkerEl) return;

        const marker = new MarkerEl({ position, map });
        return () => { marker.map = null; };
    }, [map, position?.lat, position?.lng]);

    return null;
};

/**
 * Buscador de ubicación con autocompletado de Google Places + mini-mapa.
 * Espera a que cargue el script de Maps antes de montar el contenido real
 * (LocationInputInner). Devuelve al padre {location, latitude, longitude}.
 *
 * @param {Object}   props
 * @param {Function} props.onLocationChange Callback con la ubicación elegida
 * @param {string}   [props.initialValue]   Texto inicial (al editar)
 * @param {number}   [props.initialLat]     Lat inicial (al editar)
 * @param {number}   [props.initialLng]     Lng inicial (al editar)
 */
const LocationInput = ({ onLocationChange, initialValue, initialLat, initialLng }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: MAPS_KEY,
        libraries: MAPS_LIBRARIES,
        language: 'es',
    });

    if (!isLoaded) return (
        <div className={styles.field}>
            <span className={`${styles.label} ${styles.floating}`}>Ubicación</span>
            <input className={styles.input} disabled placeholder="Cargando..." />
        </div>
    );

    return (
        <LocationInputInner
            onLocationChange={onLocationChange}
            initialValue={initialValue}
            initialLat={initialLat}
            initialLng={initialLng}
        />
    );
};

/**
 * Contenido real del buscador (ya con el script de Maps cargado).
 * Pide sugerencias a Places con debounce y, al elegir una, saca sus coordenadas
 * con fetchFields y pinta el mini-mapa.
 */
const LocationInputInner = ({ onLocationChange, initialValue, initialLat, initialLng }) => {
    const [focused,     setFocused]     = useState(false);
    const [value,       setValue]       = useState(initialValue ?? '');
    const [suggestions, setSuggestions] = useState([]);
    const [coords,      setCoords]      = useState(
        initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : null
    );
    const debounceRef = useRef(null);

    const fetchSuggestions = useCallback(async (input) => {
        if (!input || input.length < 2) { setSuggestions([]); return; }
        try {
            const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places');
            const { suggestions: results }   = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input,
                language: 'es',
            });
            setSuggestions(results ?? []);
        } catch {
            setSuggestions([]);
        }
    }, []);

    const handleChange = (e) => {
        const input = e.target.value;
        setValue(input);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(input), 300);
    };

    const handleSelect = async (suggestion) => {
        const pred      = suggestion.placePrediction;
        const main      = pred.mainText.toString();
        const secondary = pred.secondaryText?.toString();
        const text      = main + (secondary ? `, ${secondary}` : '');

        setValue(text);
        setSuggestions([]);

        try {
            const place = pred.toPlace();
            await place.fetchFields({ fields: ['location'] });
            const lat = place.location.lat();
            const lng = place.location.lng();
            setCoords({ lat, lng });
            onLocationChange({ location: text, latitude: lat, longitude: lng });
        } catch {
            onLocationChange({ location: text, latitude: null, longitude: null });
        }
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
                    {suggestions.map((s, i) => {
                        const pred      = s.placePrediction;
                        const main      = pred.mainText.toString();
                        const secondary = pred.secondaryText?.toString();
                        return (
                            <li
                                key={i}
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
                <GoogleMap
                    mapContainerClassName={styles.map}
                    center={coords}
                    zoom={15}
                    options={MAPS_OPTIONS}
                >
                    <AdvancedMarker position={coords} />
                </GoogleMap>
            )}
        </div>
    );
};

export default LocationInput;
