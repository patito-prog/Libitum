<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriesRequest;
use App\Http\Requests\RemindMeRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use function Laravel\Prompts\error;

class EventController extends Controller
{
    /**
     * 1. Muestra la lista de eventos (GET)
     */
    public function index(Request $request)
    {
        // 1. Obtenemos el usuario (que tiene la sesión abierta).
        $user = Auth::user();

        // Buscamos los eventos creados por el artista y los ordenamos por los más nuevos.
        $events = $user->createdEvents()
            ->latest()
            ->get();
        //  Respuesta para la API.
        if($request->is('api/*') || $request->expectsJson()) {
            return response()->json($events);
        }
        //  Respuesta para React.
        return Inertia::render('Events/Index', [
            'events' => $events
        ]);
    }
    public function show(Request $request, Event $event)
    {
        //2. Buscamos el evento por ID.
        $event = $event->with('categories'); // Cargamos categorías del evento.

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json($event);
        }
        //  Respuesta para React.
        return Inertia::render('Events/Show', [
            'event' => $event
        ]);
    }
    public function create()
    {
        //  Aquí solo hará falta la respuesta para React. Retorna nada más que una vista.
        //return Inertia::render('Events/Create');
    }


    /**
     * Función que crea un evento.
     * @param Request $request
     *
     */
    public function store(Request $request)
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
            // Validamos que 'categories' sea un array y que los IDs existan en la tabla
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        // 2. Recogemos el usuario.
        $user = Auth::user();

        // 3. Creamos el evento y mandamos a la base de datos (Eloquent ORM).
        $event = Event::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'slug' => Str::slug($request->title . '-' . uniqid()),
            'description' => $request->description,
            'location' => $request->location,
            'event_date' => $request->event_date,
            'price' => isset($request->price) ? $request->price : 0.00, // Si no pone precio, es gratis (0.00)
            'status' => isset($request->status) ? $request->status : 'published',
            // 'cover_image' => ... (La subida de imágenes la haremos en un paso aparte)
        ]);

        // 4. Si vienen categorías en la $request, las asociamos
        if ($request->has('categories')) {
            // attach() inserta en la tabla category_event
            $event->categories()->attach($request->categories);
        }

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Event created successfully.'
            ]);
        }
        // 5. Redirigimos al listado con un mensaje de éxito.
        return redirect()->route('event.index')->with('success', "Evento '$request->title' creado correctamente.");
    }

    /**
     * Función que edita el evento del usuario que esté usando la web en la base de datos.
     *
     * @param Request $request //El cuerpo con todos o algunos datos editados del evento.
     * @param $eventID
     */
    public function update(UpdateEventRequest $request, Event $event)
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
            'price' => isset($request->price) ? $request->price : 0.00,
            'status' => $request->status,
        ]);

        // 2. Sincronizamos las categorías.
        // sync() borrará las que ya no estén y añadirá las nuevas automáticamente.
        $event->categories()->sync($request->categories ?? []);

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()){
            //Respuestas API
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Event updated successfully.'
            ]);
        }
        //  Respuesta para React.
        return back()->with('success', 'Evento actualizado correctamente.');
    }

    /**
     * Elimina un evento de la base de datos.
     */
    public function destroy(Request $request, Event $event)
    {
        // 1. Solo el dueño del evento puede borrarlo.
        $user = Auth::user();
        if (!$user || $user->id !== $event->user_id) {
            abort(403, 'No tienes permiso para borrar este evento');
        }

        // 2. Borrado del evento(Eloquent ORM)
        $event->delete();

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Event deleted successfully.'
            ]);
        }
        //  Respuesta para React.
        return back()->with('success', "El evento '$event->title' ha sido eliminado");
    }

    public function categories(CategoriesRequest $request, Event $event)
    {
        //Las comprobaciones de sí el usuario puede insertar en categorías y las validaciones están en CategoríesRequest.

        // 1. Sincronizamos las categorías
        // El $request->validated() ya nos da los datos limpios y comprobados.

        // 2. Sincronizamos: elimina las que no estén en el array y añade las nuevas.
        $event->categories()->sync($request->validated()['category_ids']);

        //  Respuesta para API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Event categories added successfully.'
            ]);
        }

        return back()->with('success', 'Se han cambiado las categorías.');
    }

    /**
     * Función que cambia el estado de un evento (draft(borrador), published(publicado), cancelled(cancelado))
     * @param Request $request
     */
    public function status(Request $request, Event $event)
    {
        // 1. Validamos que el estado sea uno de los permitidos.
        $request->validate([
            'status' => 'required|in:draft,published,cancelled',
        ]);

        //  2. Si el ID del usuario autenticado no coincide con el user_id del evento, denegamos el acceso.
        if ($event->user_id !== $request->user()->id) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => true,
                    'message' => 'No tienes permiso para modificar este evento de Libitum.'
                ], 403); // 403 Forbidden es el código correcto aquí.
            }
            abort(403);
        }

        // 3. Actualizamos el estado.
        $event->update([
            'status' => $request->status,
        ]);

        //  Respuesta para API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Event status updated successfully.'
            ], 201);
        }
        //  Respuesta para React.
        return back();
    }

    //--------------------------- RUTAS SIN `artist` MIDDLEWARE -------------------------------------
    public function inscription(Request $request)
    {
        $request->validate(['event_id' => 'required|exists:events,id']);

        $user = Auth::user();

        // 1. Laravel comprueba internamente si ya existe la relación.
        $result = $user->events()->syncWithoutDetaching([$request->event_id]);

        // Si no se ha "adjuntado" nada nuevo (porque ya estaba), devolvemos el 409
        if (empty($result['attached'])) {
            return response()->json(['message' => 'Ya estás inscrito en este evento.'], 409);
        }

        // 2. Cargamos la relación actualizada de forma eficiente.
        $user->load('events');

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 201,
                'message' => 'Inscripción realizada con éxito.',
                // Devolvemos el último evento añadido o la lista actualizada
                'events' => $user->events
            ], 201);
        }

        return Inertia::render('User/Events/SignedUp', [
            'events' => $user->events
        ]);
    }

    public function signedUp(Request $request)
    {
        $user = Auth::user();
        //  1.  Hacemos la petición a la base de datos.
        $events = $user->events()->get();

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'code' => 200,
                'message' => 'Eventos signed up successfully.',
                'events' => $events
            ], 200);
        }
        //  Respuesta para React.
        return Inertia::render('User/Events/SignedUp', ['events' => $user->events]);
    }

    public function remindMe(RemindMeRequest $request, Event $event)
    {
        //Validamos los valores de la $request están bien en RemindMeRequest.

        // 1. Sincronizamos el campo en la tabla pivote
        Auth::user()->events()->updateExistingPivot($event->id, [
            'remind_me' => $request->remind_me
        ]);

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                "error" => false,
                'message' => 'Preferencia de recordatorio actualizada.',
                'remind_me' => (bool)$request->remind_me
            ], 200);
        }

        return back()->with('success', 'Recordatorio actualizado');
    }

    public function destroySignedUp(Request $request, Event $event)
    {
        $user = Auth::user();
        // Verificamos si existe la relación antes de intentar borrar
        if (!$user->events()->where('event_id', $event->id)->exists()) {
            return response()->json([
                'error' => true,
                'status' => 404,
                'message' => 'No estás inscrito en este evento',
            ], 404);
        }
        // Eliminamos la fila en la tabla event_user (pivote)
        $user->events()->detach($event->id);

        //  Respuesta para la API.
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                "error" => false,
                "status" => 200,
                'message' => 'Te has dado de baja del evento con éxito.'
            ], 200);
        }
        //  Respuesta para React.
        return back()->with('success', 'Te has dado de baja del evento con éxito');
    }

}
