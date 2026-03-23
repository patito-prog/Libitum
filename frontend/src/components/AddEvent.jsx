import { useState } from 'react';
import useEventContext from '../hooks/useEventContext.js';

const AddEvent = () => {
    const {
        event,
        changeStatusNewEvent,
        saveEvent
    } = useEventContext();

    const [editMode, setEditMode] = useState({
        title: false,
        location: false
    });

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Crear Nuevo Evento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* TÍTULO (con tu lógica de toggle) */}
                <div className="flex flex-col">
                    <label className="font-semibold">Título del Evento:</label>
                    <div className="flex items-center gap-2 border-b py-2">
                        {editMode.title ? (
                            <input 
                                name="title"
                                type="text" 
                                className="flex-1 outline-none"
                                placeholder="Ej: Concierto de Rock" 
                                onChange={changeStatusNewEvent}
                                onBlur={() => setEditMode({...editMode, title: false})}
                                autoFocus
                            />
                        ) : (
                            <p className="flex-1">{event.title || "Haz click en el icono para editar"}</p>
                        )}
                        <img 
                            src="/icon-edit.svg" 
                            className="cursor-pointer w-5" 
                            onClick={() => setEditMode({...editMode, title: !editMode.title})}
                        />
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="font-semibold">Descripción:</label>
                    <textarea 
                        name="description" 
                        id="description" 
                        rows="4"
                        className="border rounded p-2"
                        placeholder="Detalla de qué trata tu evento..."
                        onChange={changeStatusNewEvent}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* UBICACIÓN */}
                    <div className="flex flex-col">
                        <label className="font-semibold">Ubicación:</label>
                        <input 
                            name="location"
                            type="text"
                            placeholder="Ciudad, Calle, etc."
                            className="border rounded p-2"
                            onChange={changeStatusNewEvent}
                        />
                    </div>

                    {/* FECHA */}
                    <div className="flex flex-col">
                        <label className="font-semibold">Fecha del Evento:</label>
                        <input 
                            name="event_date"
                            type="datetime-local"
                            className="border rounded p-2"
                            onChange={changeStatusNewEvent}
                        />
                    </div>

                    {/* PRECIO */}
                    <div className="flex flex-col">
                        <label className="font-semibold">Precio (€):</label>
                        <input 
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="border rounded p-2"
                            onChange={changeStatusNewEvent}
                        />
                    </div>

                    {/* ESTADO (status_id) */}
                    <div className="flex flex-col">
                        <label className="font-semibold">Estado:</label>
                        <select 
                            name="status_id" 
                            className="border rounded p-2"
                            onChange={changeStatusNewEvent}
                        >
                            <option value="1">Borrador</option>
                            <option value="2">Publicado</option>
                        </select>
                    </div>
                </div>

                {/* IMAGEN DE PORTADA */}
                <div className="flex flex-col">
                    <label className="font-semibold">Imagen de Portada:</label>
                    <input 
                        name="cover_image"
                        type="file"
                        accept="image/*"
                        className="mt-1"
                        onChange={(e) => {
                            // Ojo: Para archivos se usa e.target.files[0]
                            changeStatusNewEvent(e); 
                        }}
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                >
                    Guardar Evento
                </button>
            </form>
        </div>
    );
}

export default AddEvent;