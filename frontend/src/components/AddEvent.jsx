import { useState } from 'react';
import useEventContext from '../hooks/useEventContext.js';
import { FloatingInput, FloatingTextarea, FloatingSelect, FloatingMultiSelect } from './FloatingInput.jsx';
import LocationInput from './LocationInput.jsx';
import styles from './AddEvent.module.scss';

/**
 * Formulario de crear/editar evento. El mismo componente sirve para ambos:
 * si editMode está activo guarda con updateEvent, si no con saveEvent. Toda la
 * lógica y el estado viven en el EventContext; aquí solo pintamos los campos.
 */
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

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit();
    };

    // Si el evento tiene un estado no editable (live/finished), usar 'published' como valor seguro
    // para evitar que el navegador elija la primera opción del select (draft) al editar.
    const editableNames    = ['draft', 'published'];
    const currentName      = statuses.find(s => s.id === event.status_id)?.name;
    const safeStatusId     = editableNames.includes(currentName)
        ? event.status_id
        : (statuses.find(s => s.name === 'published')?.id ?? event.status_id);

    return (
        <form className={styles.page} onSubmit={handleFormSubmit}>
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
                        <LocationInput
                                onLocationChange={setLocation}
                                initialValue={event.location || ''}
                                initialLat={event.latitude}
                                initialLng={event.longitude}
                            />
                    </div>

                    <div className={styles.rightCol}>
                        <label className={styles.donationToggle}>
                            <input
                                type="checkbox"
                                name="is_donation"
                                checked={!!event.is_donation}
                                onChange={changeStatusNewEvent}
                            />
                            <span>
                                💛 Donación voluntaria
                                <small>Entrada gratis · el público colabora si quiere (pasar la gorra)</small>
                            </span>
                        </label>

                        {!event.is_donation && (
                            <FloatingInput
                                id="price"
                                name="price"
                                label="Precio Entrada (€)"
                                type="number"
                                step="0.01"
                                defaultValue={event.price || ''}
                                onChange={changeStatusNewEvent}
                            />
                        )}
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
                        initialValue={event.categories ?? []}
                        onChange={changeStatusNewEvent}
                    />
                </div>

                <div className={styles.footer}>
                    <FloatingSelect
                        id="duration_hours"
                        name="duration_hours"
                        label="Duración del evento"
                        defaultValue={event.duration_hours ?? ''}
                        onChange={changeStatusNewEvent}
                    >
                        <option value="">Sin especificar (2 h por defecto)</option>
                        <option value="1">1 hora</option>
                        <option value="2">2 horas</option>
                        <option value="3">3 horas</option>
                        <option value="4">4 horas</option>
                        <option value="6">6 horas</option>
                        <option value="8">8 horas</option>
                        <option value="12">12 horas</option>
                        <option value="24">1 día</option>
                        <option value="48">2 días</option>
                        <option value="72">3 días</option>
                    </FloatingSelect>

                    <FloatingSelect
                        id="status_id"
                        name="status_id"
                        label="Visibilidad"
                        defaultValue={safeStatusId}
                        onChange={changeStatusNewEvent}
                    >
                        {statuses
                            .filter(s => ['draft', 'published'].includes(s.name))
                            .map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name === 'draft' ? 'Borrador (solo tú lo ves)' : 'Publicado (visible para todos)'}
                                </option>
                            ))
                        }
                    </FloatingSelect>
                </div>
            </div>

            <div className={styles.acceptCancel}>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                    {editMode ? 'Actualizar' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

export default AddEvent;
