<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriesRequest;
use App\Http\Requests\RemindMeRequest;
use App\Http\Requests\StatusEventRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Util\ReturnHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use function Laravel\Prompts\error;
/**
* @author Carri1x
*/
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

        return ReturnHelper::return([
            'events' => $events->load('categories, status'),
            'component' => 'Events/Index'
        ]);
    }
    public function show(Event $event)
    {
        //2. Buscamos el evento por ID y cargamos las categorías y el estado de este.
        //  toDo: Recoger los $event->attendees() para que pueda verse quien va a asistir.
        //  Hay que hacer una lógica de que si eres el creador puedes verlos y si no lo eres pues solo puedes ver el el evento en si.
        $event->load('categories', 'status');

        return ReturnHelper::return([
            'event' => $event,
            'component' => 'Events/Show'
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
    public function store(StoreEventRequest $request)
    {
        //  1. Recogemos los datos validados por StoreEventRequest.
        $data = $request->validated();

        // Creamos el evento y mandamos a la base de datos (Eloquent ORM).
        $event = Event::create([
            'user_id' => Auth::id(),
            'title' => $data['title'],
            'slug' => Str::slug($data['title'] . '-' . uniqid()),
            'description' => $data['description'],
            'location' => $data['location'],
            'event_date' => $data['event_date'],
            'price' => $data['price'] ?? 0.00, // Si no pone precio, es gratis (0.00)
            'status_id' => $data['status_id'] ?? 2, //Este es el estado `published`.
            // 'cover_image' => ... (La subida de imágenes la haremos en un paso aparte)
        ]);

        // 4. Si vienen categorías en la $request, las asociamos.
        if (!empty($data['categories'])) {
            // attach() inserta en la tabla category_event.
            $event->categories()->attach($data['categories']);
        }

        // Devolvemos el evento con sus categorías cargadas
        return ReturnHelper::ok("Evento creado correctamente", [
            'event' => $event->load('categories', 'status')
        ]);
    }

    /**
     * Función que edita el evento del usuario que esté usando la web en la base de datos.
     *
     * @param Request $request //El cuerpo con todos o algunos datos editados del evento.
     * @param $eventID
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();

        // 4. Actualizamos el evento.
        $event->update([
            'title' => $data['title'],
            // Si cambia el título, actualizamos el slug.
            'slug' => Str::slug($data['title'] . '-' . uniqid()),
            'description' => $data['description'],
            'location' => $data['location'],
            'event_date' => $data['event_date'],
            'price' => $data['price'] ?? 0.00,
            'status_id' => $data['status_id'],
        ]);

        // 2. Sincronizamos las categorías.
        // sync() -> borrará las que ya no estén y añadirá las nuevas automáticamente.
        $event->categories()->sync($data['categories'] ?? []);

        return ReturnHelper::ok('Evento creado correctamente', [
            'status' => 201
        ]);
    }

    /**
     * Elimina un evento de la base de datos.
     */
    public function destroy(Request $request, Event $event)
    {
        // 1. Solo el dueño del evento puede borrarlo.
        $user = Auth::user();
        if (!$user || $user->id !== $event->user_id) {
            ReturnHelper::abort(403, 'No tienes permiso para borrar este evento');
        }

        // 2. Borrado del evento(Eloquent ORM)
        $event->delete();

        return ReturnHelper::ok("El evento '$event->title' ha sido eliminado.");
    }

    public function categories(CategoriesRequest $request, Event $event)
    {
        // 1. Sincronizamos las categorías
        // El $request->validated() ya nos da los datos limpios y comprobados.

        // 2. Sincronizamos: elimina las que no estén en el array y añade las nuevas.
        $event->categories()->sync($request->validated()['category_ids']);

       return ReturnHelper::ok("Se han añadido las categorías correctamente.");
    }

    /**
     * Función que cambia el estado de un evento.
     * @param StatusEventRequest $request
     */
    public function status(StatusEventRequest $request, Event $event)
    {
        // 1. Obtenemos los datos validados del FormRequest
        $data = $request->validated();
        // 2. Actualizamos la relación (status_id)
        $event->update([
            'status_id' => $data['status_id'],
        ]);
        //  Cargamos la relación paraque el frontend tenga el nombre y color del nuevo estado.
        $event->load('status');

       return ReturnHelper::return(['event' => $event]);
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
            return ReturnHelper::error('Ya estás inscrito en este evento', 409);
        }

        // 2. Cargamos la relación actualizada de forma eficiente.
        $user->load('events');

        return ReturnHelper::ok('Inscripción realizada con éxito.', [
            'events' => $user->events
        ]);
    }

    public function signedUp(Request $request)
    {
        $user = Auth::user();
        //  1.  Hacemos la petición a la base de datos.
        $events = $user->events()->get();

        return ReturnHelper::return([
           'events' => $events
        ]);
    }

    public function remindMe(RemindMeRequest $request, Event $event)
    {
        //Validamos los valores de la $request están bien en RemindMeRequest.

        // 1. Sincronizamos el campo en la tabla pivote
        Auth::user()->events()->updateExistingPivot($event->id, [
            'remind_me' => $request->remind_me
        ]);

        return ReturnHelper::ok('Recordatorio actualizado');
    }

    public function destroySignedUp(Request $request, Event $event)
    {
        $user = Auth::user();
        // Verificamos si existe la relación antes de intentar borrar
        if (!$user->events()->where('event_id', $event->id)->exists()) {
            return ReturnHelper::error('No estás inscrito en este evento', 409);
        }
        // Eliminamos la fila en la tabla event_user (pivote)
        $user->events()->detach($event->id);

        return ReturnHelper::ok('Te has dado de baja del evento correctamente.');

    }

}
