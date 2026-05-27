<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriesRequest;
use App\Http\Requests\RemindMeRequest;
use App\Http\Requests\StatusEventRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Util\ReturnHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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
        //Obtenemos la id para recoger los me gusta de sus eventos
        $userId = $user->id;

        // Buscamos los eventos creados por el artista y los ordenamos por los más nuevos mostrando los likes que tiene.
        $events = $user->createdEvents()
        ->with(['categories', 'status']) 
        ->withExists(['likedBy as liked' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }])
        ->latest()
        ->get();

        return ReturnHelper::return([
            'events' => $events,
            'component' => 'Events/Index'
        ]);
    }
    public function show(Event $event)
    {
        $userId = Auth::id();
        //2. Buscamos el evento por ID y cargamos las categorías y el estado de este.
        //  toDo: Recoger los $event->attendees() para que pueda verse quien va a asistir.
        //  Hay que hacer una lógica de que si eres el creador puedes verlos y si no lo eres pues solo puedes ver el el evento en si.
        $event->load('categories', 'status', 'artist');

        $event->liked = $userId ? $event->likedBy()->where('user_id', $userId)->exists() : false;

        return ReturnHelper::return([
            'event' => $event,
            'component' => 'Events/Show'
        ]);
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
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'event_date' => $data['event_date'],
            'price' => $data['price'] ?? 0.00,
            'status_id' => $data['status_id'] ?? 2,
            'max_capacity' => $data['max_capacity'] ?? null,
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
            'slug' => Str::slug($data['title'] . '-' . uniqid()),
            'description' => $data['description'],
            'location' => $data['location'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'event_date' => $data['event_date'],
            'price' => $data['price'] ?? 0.00,
            'status_id' => $data['status_id'],
            'max_capacity' => $data['max_capacity'] ?? null,
        ]);

        $event->categories()->sync($data['categories'] ?? []);

        return response()->json([
            'message' => 'Evento actualizado correctamente',
            'event' => $event->load('categories', 'status'),
        ]);
    }

    /**
     * Elimina un evento de la base de datos.
     */
    public function destroy(Request $request, Event $event)
    {
        $user = Auth::user();
        if (!$user || $user->id !== $event->user_id) {
            return response()->json([
                'error' => true,
                'message' => 'No tienes permiso para borrar este evento',
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => "El evento '$event->title' ha sido eliminado.",
        ]);
    }

    public function categories(CategoriesRequest $request, Event $event)
    {
        $event->categories()->sync($request->validated()['category_ids']);

        return response()->json([
            'message' => 'Se han añadido las categorías correctamente.',
        ]);
    }

    /**
     * Función que cambia el estado de un evento.
     */
    public function status(StatusEventRequest $request, Event $event)
    {
        $data = $request->validated();

        $event->update(['status_id' => $data['status_id']]);
        $event->load('status');

        return response()->json(['event' => $event]);
    }

    //--------------------------- RUTAS SIN `artist` MIDDLEWARE -------------------------------------

    public function inscription(Request $request)
    {
        $request->validate(['event_id' => 'required|exists:events,id']);
        $user = Auth::user();

        $result = $user->events()->syncWithoutDetaching([$request->event_id]);

        if (empty($result['attached'])) {
            return response()->json([
                'error' => true,
                'message' => 'Ya estás inscrito en este evento',
            ], 409);
        }

        $user->load('events');

        return response()->json([
            'message' => 'Inscripción realizada con éxito.',
            'events' => $user->events,
        ]);
    }

    public function signedUp(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;
        //  1.  Hacemos la petición a la base de datos.
        $events = $user->events()->with(['categories', 'status']) // Cargamos relaciones necesarias
            ->withExists(['likedBy as liked' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])->get();

        return ReturnHelper::return([
            'events' => $events
        ]);
    }

    public function remindMe(RemindMeRequest $request, Event $event)
    {
        Auth::user()->events()->updateExistingPivot($event->id, [
            'remind_me' => $request->remind_me,
        ]);

        return response()->json(['message' => 'Recordatorio actualizado']);
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

    //METODOS PARA ADMIN
    public function allEventsForAdmin()
    {
        $userId = Auth::id();
        // Usamos with('user') para que nos traiga también los datos del creador.
        $events = Event::with(['artist', 'categories', 'status'])->withExists(['likedBy as liked' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }])->latest()->get();

        // Lo devolvemos de la misma forma que AdminUserController
        // para que tu response.data de React lo lea perfectamente.
        return ReturnHelper::return([
            'data' => $events
        ]);
    }

    /**
     * Elimina cualquier evento de la base de datos.
     */
    public function destroyByAdmin($id)
    {
        // Buscamos el evento real por su ID a la fuerza.
        // Si no existe, lanzará un error 404 automáticamente.
        $event = Event::findOrFail($id);
        
        // Guardamos el título en una variable para el mensaje final
        $titulo = $event->title;

        // 2. Por seguridad, si tu base de datos es estricta, 
        // desvinculamos las categorías y likes antes de borrar el evento.
        $event->categories()->detach();
        $event->likedBy()->detach(); 
        
        // 3. Borramos el evento de verdad
        $event->delete();

        return ReturnHelper::ok("El evento '$titulo' ha sido eliminado por moderación.");
    }

    //METODO DE BÚSQUEDA PÚBLICA
    public function search(Request $request)
    {
        $userId = Auth::id();

        $query = Event::with(['artist', 'categories', 'status']);

        if ($userId) {
            $query->withExists(['likedBy as liked' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->withExists(['attendees as signed_up' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }]);
        }

        // Búsqueda por texto en título, descripción, lugar y nombre del artista
        if ($request->filled('q')) {
            $term = $request->q;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'ilike', "%{$term}%")
                  ->orWhere('description', 'ilike', "%{$term}%")
                  ->orWhere('location', 'ilike', "%{$term}%")
                  ->orWhereHas('artist', fn($q) => $q->where('name', 'ilike', "%{$term}%"));
            });
        }

        // Filtro por categoría
        if ($request->filled('category_id')) {
            $query->whereHas('categories', fn($q) => $q->where('categories.id', $request->category_id));
        }

        // Filtro por estado
        $allowedStatuses = ['draft', 'published', 'live', 'finished', 'cancelled'];
        if ($request->filled('status') && in_array($request->status, $allowedStatuses)) {
            $query->whereHas('status', fn($q) => $q->where('name', $request->status));
        }

        $events = $query->latest()->paginate(12);

        return response()->json([
            'error' => false,
            'data'  => $events,
        ]);
    }

    public function uploadCover(Request $request, Event $event)
    {
        if (Auth::id() !== $event->user_id) {
            return response()->json(['error' => true, 'message' => 'No tienes permiso para editar este evento.'], 403);
        }

        $request->validate([
            'cover' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $path = $request->file('cover')->store('events', 'public');
        $url  = $request->getSchemeAndHttpHost() . '/storage/' . $path;

        $event->update(['cover_image' => $url]);

        return response()->json(['error' => false, 'data' => ['cover_image' => $url]]);
    }

    //METODO PARA FAVORITOS
    public function favorites(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $events = $user->likes()
            ->with(['artist', 'categories', 'status'])
            ->withExists(['likedBy as liked' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->latest()
            ->get();

        return ReturnHelper::return([
            'events' => $events
        ]);
    }

}
