<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEventRequest;
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
        // 1. Obtenemos el usuario (que tiene la sesión abierta).
        $user = Auth::user();

        // Buscamos los eventos creados por el artista y los ordenamos por los más nuevos.
        $events = $user->createdEvents()
            ->latest()
            ->get();

        return Inertia::render('Events/Index', [
            'events' => $events
        ]);
    }
    public function show(int $id): Response
    {

        //2. Buscamos el evento por ID.
        $event = Event::where('id', $id)
            ->with('categories') // Cargamos categorías del evento.
            ->firstOrFail(); // Si no existe lanza un 404.

        return Inertia::render('Events/Show', [
            'event' => $event
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

        // 3. Recogemos el usuario.
        $user = Auth::user();

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
    public function update(UpdateEventRequest $request, Event $event): RedirectResponse | Response
    {
        //Los pasos anteriores están en UpdateEventRequest...

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

        if($request->accepts('json')){
            //Respuestas API
            //return response()->json([])
        }else{
            //Respuestas Visuales
        }
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

    public function categories(Request $request, Event $event): RedirectResponse
    {
        // 1. Validamos que las categorías existan en la tabla 'categories'
        $validated = $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id'
        ]);

        // 2. Sincronizamos: elimina las que no estén en el array y añade las nuevas
        $event->categories()->sync($validated['category_ids']);

        return back()->with('success', 'Se han cambiado las categorías.');
    }

    /**
     * Función que cambia el estado de un evento (draft(borrador),published(publicado),cancelled(cancelado))
     * @param Request $request
     * @param $eventoId
     * @return void
     */
    public function status(Request $request, $eventoId)
    {
        $user = Auth::user();
        // 1. Buscamos el evento que coincida con el ARTISTA que lo ha creado y con el ID de ese propio evento.
        //  Si no existe mandamos un 404 - not found.
        $event = Event::where('id', $eventoId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        //  2. Validamos que el estado que quiere asignarle está entre los requeridos.
        $event->validate([
            'status' => 'required|in:draft,published,cancelled',
        ]);

        // 3. Actualizamos el estado del evento.
        $event->update([
            'status' => $request->status,
        ]);
    }

    //--------------------------- RUTAS SIN `es_artist` MIDDLEWARE -------------------------------------
    public function inscription($eventId)
    {
        $user = Auth::user();
        //  2. Si no encuentra el evento lanza un 404 - not found. (Si realmente no existe ese evento es porque el usuario se está inventando el ID, si no, no le saldría para poder inscribirse).
        $event = Event::findOrFail($eventId);
        //  Verificamos que ese usuario no tiene ya este evento inscrito.
        $user->events()->attach($event->id);


    }

}
