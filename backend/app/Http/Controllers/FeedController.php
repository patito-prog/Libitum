<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Construye el feed "Para Ti".
 */
class FeedController extends Controller
{
    /**
     * Devuelve el feed paginado.
     *
     * Dos modos: 'following' (eventos de los artistas que sigo, por fecha) y
     * 'discover' (de cualquiera menos los míos, en orden aleatorio). Nunca
     * incluye borradores. Admite filtro por estado EFECTIVO (calculado por la
     * fecha real + duración, no por el estado guardado).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        //Cargamos relaciones y verificamos si el usuario le dio LIKE
        $query = Event::with(['artist', 'categories', 'status'])
            ->whereHas('status', fn($q) => $q->where('name', '!=', 'draft'))
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

        // Filtro por estado efectivo calculado por fecha real.
        // Se usa aritmética de intervalos PostgreSQL sin placeholders PDO para evitar
        // el conflicto del operador ? de JSON con los bind params de PDO.
        if ($request->filled('status')) {
            $now = now();

            switch ($request->status) {
                case 'published':
                    // Próximos: aún no han empezado
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['published', 'live']))
                          ->where('event_date', '>', $now);
                    break;

                case 'live':
                    // En curso: empezaron pero no ha pasado su duración
                    $query->whereHas('status', fn($q) => $q->whereIn('name', ['published', 'live']))
                          ->where('event_date', '<=', $now)
                          ->whereRaw(
                              "event_date + (COALESCE(duration_hours, 2)::integer * INTERVAL '1 hour') > NOW()"
                          );
                    break;

                case 'finished':
                    // Terminados: eventos cuya duración ha transcurrido O que están
                    // almacenados como 'finished' (datos existentes antes de la migración)
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