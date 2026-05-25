<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriesRequest;
use App\Http\Requests\RemindMeRequest;
use App\Http\Requests\StatusEventRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
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
        $user = Auth::user();

        $events = $user->createdEvents()
            ->latest()
            ->get();

        return response()->json([
            'events' => $events->load(['categories', 'status']),
        ]);
    }

    public function show(Event $event)
    {
        $event->load('categories', 'status');

        return response()->json([
            'event' => $event,
        ]);
    }

    /**
     * Función que crea un evento.
     */
    public function store(StoreEventRequest $request)
    {
        $data = $request->validated();

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
        ]);

        if (!empty($data['categories'])) {
            $event->categories()->attach($data['categories']);
        }

        return response()->json([
            'message' => 'Evento creado correctamente',
            'event' => $event->load('categories', 'status'),
        ], 201);
    }

    /**
     * Función que edita el evento del usuario.
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();

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
        $events = $user->events()->get();

        return response()->json(['events' => $events]);
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

        if (!$user->events()->where('event_id', $event->id)->exists()) {
            return response()->json([
                'error' => true,
                'message' => 'No estás inscrito en este evento',
            ], 409);
        }

        $user->events()->detach($event->id);

        return response()->json([
            'message' => 'Te has dado de baja del evento correctamente.',
        ]);
    }
}
