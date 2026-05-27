<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        //Cargamos relaciones y verificamos si el usuario le dio LIKE
        $query = Event::with(['artist', 'categories', 'status'])
            ->withExists(['likedBy as liked' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->withExists(['attendees as signed_up' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }]);

        //Comprobamos el "modo" (Por defecto será 'discover' si no envían nada)
        $mode = $request->query('mode', 'discover');

        if ($mode === 'following') {
            // --- MODO "SIGUIENDO" ---
            $followingIds = $user->following()->pluck('artist_id');
            $query->whereIn('user_id', $followingIds)->latest(); // Los más recientes de quienes sigo
        } else {
            // --- MODO "DESCUBRIR / PARA TI" ---
            // Eventos de cualquiera (aleatorios), pero EXCLUIMOS los creados por el propio usuario
            $query->where('user_id', '!=', $userId)->inRandomOrder(); 
        }

        // Filtro por estado del evento
        $allowedStatuses = ['draft', 'published', 'live', 'finished', 'cancelled'];
        if ($request->filled('status') && in_array($request->status, $allowedStatuses)) {
            $query->whereHas('status', fn($q) => $q->where('name', $request->status));
        }

        // Filtro de zona/ciudad (Funciona para ambos modos)
        if ($request->filled('city')) {
            $query->whereHas('artist', fn($q) => $q->where('city', $request->city));
        }

        //Paginamos (modo TikTok)
        $events = $query->paginate(10);

        return response()->json([
            'error' => false,
            'data' => $events
        ]);
    }
}