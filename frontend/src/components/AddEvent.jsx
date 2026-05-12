import { useState } from 'react';
import useEventContext from '../hooks/useEventContext.js';
import { FloatingInput, FloatingTextarea, FloatingSelect, FloatingMultiSelect } from './FloatingInput.jsx';
import LocationInput from './LocationInput.jsx';
import FloatingOptionsSelect from './FloatingOptionsSelect.jsx';
import styles from './AddEvent.module.scss';

const AddEvent = () => {
    const { 
        changeStatusNewEvent,
        setLocation,
        saveEvent,
        categories,
        statuses,
    } = useEventContext();

    const [preview, setPreview] = useState(null);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) setPreview(URL.createObjectURL(file));
        changeStatusNewEvent(e);
    };

    return (
        <div className={styles.page}>
            <div className={styles.bottomCard}>
                {/* ── TOP CARD: imagen + título ── */}
                <div className={styles.topCard}>
                    <label htmlFor="cover_image" className={styles.imageUpload}>
                        {preview
                            ? <img src={preview} className={styles.imagePreview} alt="Portada del evento" />
                            : <p>Haz click para añadir<br />la portada del evento</p>
                        }
                        <input
                            type="file"
                            id="cover_image"
                            name="cover_image"
                            accept="image/*"
                            onChange={handleImage}
                        />
                    </label>
                    <FloatingInput
                        id="title"
                        name="title"
                        label="Título del Evento"
                        onChange={changeStatusNewEvent}
                    />
                </div>
                <FloatingTextarea
                    id="description"
                    name="description"
                    label="Descripción"
                    placeholder="Detalla de qué trata tu evento..."
                    onChange={changeStatusNewEvent}
                />

                <div className={styles.grid}>

                    <div className={styles.locationCol}>
                        <LocationInput onLocationChange={setLocation} />
                    </div>

                    <div className={styles.rightCol}>
                        <FloatingInput
                            id="price"
                            name="price"
                            label="Precio Entrada (€)"
                            type="number"
                            step="0.01"
                            onChange={changeStatusNewEvent}
                        />
                        <FloatingInput
                            id="event_date"
                            name="event_date"
                            label="Fecha del Evento"
                            type="datetime-local"
                            onChange={changeStatusNewEvent}
                        />
                        <FloatingInput
                            id="max_capacity"
                            name="max_capacity"
                            label="Capacidad máxima"
                            placeholder="200"
                            onChange={changeStatusNewEvent}
                        />
                    </div>
                    <FloatingMultiSelect
                        id="categories"
                        name="categories"
                        label="Categorías"
                        options={categories}
                        onChange={changeStatusNewEvent}
                    />
                </div>

                <div className={styles.footer}>
                    <FloatingSelect
                        id="status_id"
                        name="status_id"
                        label="Estado"
                        onChange={changeStatusNewEvent}
                    >   
                        { 
                            statuses && statuses.length > 0 && <FloatingOptionsSelect data={statuses}/>
                        }
                    </FloatingSelect>

                    <button type="submit" className={styles.submitBtn} onClick={saveEvent}>
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddEvent;
