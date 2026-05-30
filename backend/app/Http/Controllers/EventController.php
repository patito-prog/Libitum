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
     * Lista los eventos creados por el artista logueado (GET /events).
     * Los devuelve del más nuevo al más viejo, con su nº de inscritos y un flag
     * de si el propio artista les ha dado like.
     */
    public function index(Request $request)
    {
        $user   = Auth::user();
        $userId = $user->id;

        $events = $user->createdEvents()
        ->with(['categories', 'status'])
        ->withCount('attendees')
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
    /**
     * Devuelve el detalle de un evento (GET /events/{event}).
     *
     * Carga categorías, estado y artista, y añade dos flags calculados para el
     * usuario actual: si le ha dado like y si está apuntado. Si no hay sesión,
     * ambos van a false.
     *
     * @param Event $event Inyectado por route-model binding
     */
    public function show(Event $event)
    {
        $userId = Auth::id();

        $event->load('categories', 'status', 'artist');
        $event->loadCount('attendees'); // nº de inscritos, para mostrar plazas

        $event->liked     = $userId ? $event->likedBy()->where('user_id', $userId)->exists()  : false;
        $event->signed_up = $userId ? $event->attendees()->where('user_id', $userId)->exists() : false;

        return ReturnHelper::return([
            'event' => $event,
            'component' => 'Events/Show'
        ]);
    }


    /**
     * Crea un evento (POST /events).
     *
     * Los datos ya vienen validados por StoreEventRequest. Generamos un slug
     * único a partir del título y, si llegan categorías, las asociamos en la
     * tabla pivote category_event.
     *
     * @param StoreEventRequest $request Petición ya validada
     */
    public function store(StoreEventRequest $request)
    {
        $data = $request->validated();

        // Donación voluntaria: entrada gratis, así que el precio fijo no aplica.
        $isDonation = !empty($data['is_donation']);

        $event = Event::create([
            'user_id' => Auth::id(),
            'title' => $data['title'],
            'slug' => Str::slug($data['title'] . '-' . uniqid()),
            'description' => $data['description'],
            'location' => $data['location'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'event_date' => $data['event_date'],
            'price' => $isDonation ? 0.00 : ($data['price'] ?? 0.00),
            'is_donation'    => $isDonation,
            'status_id'      => $data['status_id']      ?? 2,
            'max_capacity'   => $data['max_capacity']   ?? null,
            'duration_hours' => $data['duration_hours'] ?? null,
        ]);

        // Si vienen categorías, las enganchamos en la tabla pivote.
        if (!empty($data['categories'])) {
            $event->categories()->attach($data['categories']);
        }

        return ReturnHelper::ok("Evento creado correctamente", [
            'event' => $event->load('categories', 'status')
        ]);
    }

    /**
     * Actualiza un evento existente (PUT /events/{event}).
     * Regenera el slug por si cambió el título y sincroniza las categorías
     * (sync deja exactamente las que lleguen, quitando las que ya no estén).
     *
     * @param UpdateEventRequest $request Petición ya validada
     * @param Event              $event   Evento a actualizar (route-model binding)
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();

        $isDonation = !empty($data['is_donation']);

        $event->update([
            'title' => $data['title'],
            'slug' => Str::slug($data['title'] . '-' . uniqid()),
            'description' => $data['description'],
            'location' => $data['location'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'event_date' => $data['event_date'],
            'price' => $isDonation ? 0.00 : ($data['price'] ?? 0.00),
            'is_donation'    => $isDonation,
            'status_id'      => $data['status_id'],
            'max_capacity'   => $data['max_capacity']   ?? null,
            'duration_hours' => $data['duration_hours'] ?? null,
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

    /* ──────────  Acciones del espectador (sin middleware artist)  ────────── */

    public function inscription(Request $request)
    {
        $request->validate(['event_id' => 'required|exists:events,id']);
        $user  = Auth::user();
        $event = Event::findOrFail($request->event_id);

        if ($event->max_capacity !== null) {
            $current = $event->attendees()->count();
            if ($current >= $event->max_capacity) {
                return response()->json([
                    'error'   => true,
                    'message' => 'Este evento ha alcanzado su aforo máximo.',
                ], 409);
            }
        }

        $result = $user->events()->syncWithoutDetaching([$request->event_id]);

        if (empty($result['attached'])) {
            return response()->json([
                'error'   => true,
                'message' => 'Ya estás inscrito en este evento',
            ], 409);
        }

        $user->load('events');

        return response()->json([
            'message' => 'Inscripción realizada con éxito.',
            'events'  => $user->events,
        ]);
    }

    /**
     * Lista los eventos a los que el usuario está apuntado (sus asistencias),
     * con un flag de si les ha dado like.
     */
    public function signedUp(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $events = $user->events()->with(['categories', 'status'])
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

    /* ───────────────  Endpoints de administración  ─────────────── */

    /** Lista TODOS los eventos (de cualquier artista) para el panel admin. */
    public function allEventsForAdmin()
    {
        // Cargamos artista y estado, y contamos asistentes de cada evento.
        $events = Event::with(['artist', 'status'])
            ->withCount('attendees')
            ->latest()
            ->get();

        return ReturnHelper::return([
            'data' => $events
        ]);
    }

    /**
     * Borra cualquier evento por moderación (solo admin).
     * findOrFail lanza 404 si no existe. Antes de borrar desvinculamos
     * categorías y likes para no dejar filas huérfanas en las pivotes.
     *
     * @param int $id Id del evento
     */
    public function destroyByAdmin($id)
    {
        $event  = Event::findOrFail($id);
        $titulo = $event->title; // lo guardamos para el mensaje final

        $event->categories()->detach();
        $event->likedBy()->detach();
        $event->delete();

        return ReturnHelper::ok("El evento '$titulo' ha sido eliminado por moderación.");
    }

    /* ───────────────  Búsqueda pública de eventos  ─────────────── */
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

        // Los borradores nunca son públicos
        $query->whereHas('status', fn($q) => $q->where('name', '!=', 'draft'));

        // Filtro por estado efectivo (misma lógica de fecha que el feed)
        if ($request->filled('status')) {
            $now = now();

            switch ($request->status) {
                case 'published':
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['published', 'live']))
                          ->where('event_date', '>', $now);
                    break;

                case 'live':
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['published', 'live']))
                          ->where('event_date', '<=', $now)
                          ->whereRaw(
                              "event_date + (COALESCE(duration_hours, 2)::integer * INTERVAL '1 hour') > NOW()"
                          );
                    break;

                case 'finished':
                    $query->whereHas('status', fn($q) => $q->whereNotIn('name', ['draft', 'cancelled']))
                          ->where(function ($q) {
                              $q->whereHas('status', fn($sq) => $sq->where('name', 'finished'))
                                ->orWhereRaw(
                                    "event_date + (COALESCE(duration_hours, 2)::integer * INTERVAL '1 hour') <= NOW()"
                                );
                          });
                    break;

                case 'cancelled':
                    $query->whereHas('status', fn($q) => $q->where('name', 'cancelled'));
                    break;
            }
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

    /* ───────────────  Favoritos (eventos con like)  ─────────────── */
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
