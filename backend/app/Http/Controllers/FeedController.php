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

        // Filtro de zona/ciudad (Funciona para ambos modos)
        // Ejemplo de petición: /api/feed?mode=discover&city=Madrid
        if ($request->has('city') && !empty($request->city)) {
            $query->whereHas('artist', function($q) use ($request) {
                $q->where('city', $request->city);
            });
        }

        //Paginamos (modo TikTok)
        $events = $query->paginate(10);

        return response()->json([
            'error' => false,
            'data' => $events
        ]);
    }
}