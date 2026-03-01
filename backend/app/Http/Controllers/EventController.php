<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * 1. Muestra la lista de eventos (GET)
     */
    public function index(): Response
    {
        /*
         * 2. El tema de $user->events (¡Cuidado aquí!)

        $events = $user->events; // Esto funciona si tienes definida la relación en el modelo User.

            Tienes la relación events() definida en tu modelo User, pero fíjate en el comentario que pusiste: "Los eventos a los que asiste el usuario (como espectador)".

                Esa relación usa la tabla intermedia event_user. Si usas $user->events en el controlador de artistas, lo que estarás trayendo son los conciertos a los que el artista va a ir como público, no los que él ha creado.

                Para arreglarlo y que funcione como quieres, añade esta SEGUNDA relación en tu modelo User:

                PHP
                /**
                 * Los eventos que el usuario HA CREADO (como artista).
                 /
                        //public function createdEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
                    {
                        // Un usuario tiene muchos eventos creados (Foreign key: user_id en la tabla events)
                        //return $this->hasMany(Event::class, 'user_id');
                    }
                        //Ahora sí, en tu EventController, puedes hacer esto (que es mucho más elegante):
                public function index(): Response
                    {
                        $user = Auth::user();

                        // Traemos solo los eventos que él ha creado
                        $events = $user->createdEvents()->latest()->get();

                        return Inertia::render('Events/Index', [
                            'events' => $events
                        ]);
           }*/
        // 1. Obtenemos el usuario que tiene la sesión abierta.
        $user = Auth::user();

        // 2. Filtramos: "Tráeme los eventos donde la columna user_id coincida con el ID del usuario".
        $events = Event::where('user_id', $user->id)
            ->latest() // Los pone en orden, los más nuevos primero.
            ->get();

        /**
         *  TENEMOS QUE PROBAR A HACER ESTO -> $events = $user->events; //Esto funciona si tenemos definida la relación en el modelo User
         *
         */

        return Inertia::render('Events/Index', [
            'events' => $events
        ]);
    }
    public function create(): Response
    {
        return Inertia::render('Events/Create');
    }


    /**
     * Función que crea un evento.
     * @param Request $request
     * @return RedirectResponse
     *
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validamos los datos que llegan del formulario de React
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'event_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
            // De momento validamos que status sea uno de estos, ajústalo a tu lógica
            'status' => 'nullable|in:draft,published,cancelled',
        ]);

        // 2. Recogemos al usuario que está logueado en este momento.
        $user = Auth::user();
        if(!$user || $user->role !== 'artist'){
            abort(403, 'Acceso denegado. Solo los artistas pueden crear eventos.');
        }

        // 4. Creamos el evento y mandamos a la base de datos (Eloquent ORM).
        Event::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'slug' => Str::slug($request->title . '-' . uniqid()),
            'description' => $request->description,
            'location' => $request->location,
            'event_date' => $request->event_date,
            'price' => $request->price ?? 0.00, // Si no pone precio, es gratis (0.00)
            'status' => $request->status ?? 'published',
            // 'cover_image' => ... (La subida de imágenes la haremos en un paso aparte)
        ]);

        // 5. Redirigimos al listado con un mensaje de éxito.
        return redirect()->route('event.index')->with('success', "Evento '$request->title' creado correctamente.");
    }

    /**
     * Función que edita el evento del usuario que esté usando la web en la base de datos.
     *
     * @param Request $request //El cuerpo con todos o algunos datos editados del evento.
     * @param $eventID
     * @return RedirectResponse|JsonResponse
     */
    public function update(Request $request, $eventID): RedirectResponse
    {
        // 1. Si no encuentra el evento lanza un 404(not found).
        $event = Event::findOrFail($eventID);

        // 2. Solo el dueño del evento puede editarlo. (¿Es el dueño del evento?)
        $user = Auth::getUser();
        if(!$user || $user->id !== $event->user_id) {
            abort(403, 'No tienes permiso para editar este evento.');
        }

        // 3. Validamos los nuevos datos.
        $request->validate([
            'title'=>'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'event_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,cancelled',
        ]);

        // 4. Actualizamos el evento.
        $event->update([
            'title' => $request->title,
            // Si cambia el título, actualizamos el slug.
            'slug' => Str::slug($request->title . '-' . uniqid()),
            'description' => $request->description,
            'location' => $request->location,
            'event_date' => $request->event_date,
            'price' => $request->price ?? 0.00,
            'status' => $request->status,
        ]);

        return back()->with('success', 'Evento actualizado correctamente.');
    }

    /**
     * Elimina un evento de la base de datos.
     * @param int $id
     * @return RedirectResponse
     */
    public function destroy($id): RedirectResponse
    {
        // 1. Buscamos el evento (si no existe, 404 automático)
        $event = Event::findOrFail($id);

        // 2. Solo el dueño del evento puede borrarlo.
        $user = Auth::user();
        if (!$user || $user->id !== $event->user_id) {
            abort(403, 'No tienes permiso para borrar este evento');
        }

        // 3. Borrado del evento(Eloquent ORM)
        $event->delete();

        return back()->with('success', "El evento '$event->title' ha sido eliminado");
    }

}
