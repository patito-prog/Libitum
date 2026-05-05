import { useState } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import styles from './LocationInput.module.scss';

const LIBRARIES = ['places'];

const LocationInput = ({ onLocationChange }) => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
        libraries: LIBRARIES,
        language: 'es',
    });

    if (!isLoaded) return (
        <div className={styles.field}>
            <span className={`${styles.label} ${styles.floating}`}>Ubicación</span>
            <input className={styles.input} disabled placeholder="Cargando mapa..." />
        </div>
    );

    return <LocationInputInner onLocationChange={onLocationChange} />;
};

const LocationInputInner = ({ onLocationChange }) => {
    const [focused, setFocused] = useState(false);
    const [coords, setCoords] = useState(null);

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({ debounce: 300 });

    const floating = focused || !!value;

    const handleSelect = async (description) => {
        setValue(description, false);
        clearSuggestions();

        const results = await getGeocode({ address: description });
        const { lat, lng } = await getLatLng(results[0]);

        setCoords({ lat, lng });
        onLocationChange({ location: description, latitude: lat, longitude: lng });
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.field}>
                <label className={`${styles.label} ${floating ? styles.floating : ''}`}>
                    Ubicación
                </label>
                <input
                    className={styles.input}
                    value={value}
                    disabled={!ready}
                    placeholder={focused ? 'Ciudad, calle...' : ''}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>

            {status === 'OK' && (
                <ul className={styles.suggestions}>
                    {data.map(({ place_id, structured_formatting: { main_text, secondary_text } }) => (
                        <li
                            key={place_id}
                            className={styles.suggestion}
                            onMouseDown={() => handleSelect(main_text + (secondary_text ? `, ${secondary_text}` : ''))}
                        >
                            <strong>{main_text}</strong>
                            {secondary_text && <span> — {secondary_text}</span>}
                        </li>
                    ))}
                </ul>
            )}

            {coords && (
                <GoogleMap
                    mapContainerClassName={styles.map}
                    center={coords}
                    zoom={15}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                >
                    <Marker position={coords} />
                </GoogleMap>
            )}
        </div>
    );
};

export default LocationInput;
