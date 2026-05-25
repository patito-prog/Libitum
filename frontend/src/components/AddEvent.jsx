import { useState } from 'react';
import useEventContext from '../hooks/useEventContext.js';
import { FloatingInput, FloatingTextarea, FloatingSelect, FloatingMultiSelect } from './FloatingInput.jsx';
import LocationInput from './LocationInput.jsx';
import FloatingOptionsSelect from './FloatingOptionsSelect.jsx';
import styles from './AddEvent.module.scss';

const AddEvent = () => {
    const {
        event,
        editMode,
        changeStatusNewEvent,
        setLocation,
        saveEvent,
        updateEvent,
        categories,
        statuses,
        changeDecisionAddEvent,
        changeDecisionEditMode,
    } = useEventContext();

    const [preview, setPreview] = useState(event.cover_image ?? null);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) setPreview(URL.createObjectURL(file));
        changeStatusNewEvent(e);
    };

    const handleCancel = editMode ? changeDecisionEditMode : changeDecisionAddEvent;
    const handleSubmit = editMode ? updateEvent : saveEvent;

    return (
        <div className={styles.page}>
            <div className={styles.bottomCard}>
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
                        defaultValue={event.title}
                        onChange={changeStatusNewEvent}
                    />
                </div>

                <FloatingTextarea
                    id="description"
                    name="description"
                    label="Descripción"
                    placeholder="Detalla de qué trata tu evento..."
                    defaultValue={event.description}
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
                            defaultValue={event.price || ''}
                            onChange={changeStatusNewEvent}
                        />
                        <FloatingInput
                            id="event_date"
                            name="event_date"
                            label="Fecha del Evento"
                            type="datetime-local"
                            defaultValue={event.event_date ? event.event_date.slice(0, 16) : ''}
                            onChange={changeStatusNewEvent}
                        />
                        <FloatingInput
                            id="max_capacity"
                            name="max_capacity"
                            label="Capacidad máxima"
                            placeholder="200"
                            defaultValue={event.max_capacity || ''}
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
                        defaultValue={event.status_id}
                        onChange={changeStatusNewEvent}
                    >
                        {statuses?.length > 0 && <FloatingOptionsSelect data={statuses} />}
                    </FloatingSelect>
                </div>
            </div>

            <div className={styles.acceptCancel}>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.submitBtn} onClick={handleSubmit}>
                    {editMode ? 'Actualizar' : 'Guardar'}
                </button>
            </div>
        </div>
    );
};

export default AddEvent;
