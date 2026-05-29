<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use \App\Models\Event;

/**
 * Gestiona el perfil público del artista (la landing del QR).
 * Permite al artista editar su bio/redes/donación y expone la vista pública
 * con sus próximos eventos y estadísticas.
 */
class ArtistProfileController extends Controller
{
    // Plataformas de donación admitidas. Solo aceptamos URLs de estos dominios
    // para que un artista no pueda colar un enlace fraudulento a sus seguidores.
    private const TRUSTED_DONATION_DOMAINS = [
        'ko-fi.com', 'buymeacoffee.com', 'paypal.com', 'paypal.me',
        'patreon.com', 'gofundme.com', 'stripe.com', 'twitch.tv',
        'streamlabs.com', 'github.com', 'opencollective.com',
    ];

    /**
     * Actualiza el perfil de artista del usuario logueado (bio, redes, donación).
     * La URL de donación se valida contra la lista de dominios de confianza.
     */
    public function update(Request $request)
    {
        $request->validate([
            'bio'           => 'nullable|string|max:1000',
            'spotify_url'   => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url'   => 'nullable|url|max:255',
            'tiktok_url'    => 'nullable|url|max:255',
            'donation_url'  => [
                'nullable', 'url', 'max:255',
                function ($attribute, $value, $fail) {
                    if (!$value) return;
                    $host = strtolower(parse_url($value, PHP_URL_HOST) ?? '');
                    $host = ltrim($host, 'www.');
                    foreach (self::TRUSTED_DONATION_DOMAINS as $domain) {
                        if ($host === $domain || str_ends_with($host, '.' . $domain)) return;
                    }
                    $fail('La URL de donación debe ser de una plataforma de confianza: Ko-fi, Buy Me a Coffee, PayPal, Patreon, GoFundMe, Stripe o Twitch.');
                },
            ],
            // Móvil para Bizum (opcional). Lo valida un móvil español: 9 dígitos
            // empezando por 6 o 7, admitiendo el prefijo +34 y espacios.
            'bizum_phone'   => [
                'nullable', 'string', 'max:20',
                function ($attribute, $value, $fail) {
                    if (!$value) return;
                    $digits = preg_replace('/\D/', '', $value);
                    if (strlen($digits) === 11 && str_starts_with($digits, '34')) {
                        $digits = substr($digits, 2);
                    }
                    if (!preg_match('/^[67]\d{8}$/', $digits)) {
                        $fail('El número de Bizum debe ser un móvil español válido (9 dígitos, empieza por 6 o 7).');
                    }
                },
            ],
        ]);

        Auth::user()->artistProfile->update([
            'bio' => $request->bio,
            'spotify_url' =>$request->spotify_url,
            'instagram_url'=>$request->instagram_url,
            'youtube_url'=>$request->youtube_url,
            'tiktok_url'=>$request->tiktok_url,
            'donation_url'=>$request->donation_url,
            'bizum_phone'=>$request->bizum_phone,
        ]);

        // Respuesta para la API
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Perfil de artista actualizado correctamente',
                'code' => 200
            ], 200);
        }

        // Respuesta para React
        return back();
    }

    /**
     * Devuelve el perfil público de un artista (GET /artists/{id}).
     * Incluye su perfil, próximos eventos publicados, nº de seguidores y si el
     * usuario actual ya lo sigue. Devuelve 404 si el id no es de un artista.
     *
     * @param int $id Id del artista
     */
    public function show(Request $request, $id){
        $currentUserId = Auth::id();

        $artist = User::with([
            'artistProfile',
            'createdEvents' => function ($q) {
                $q->with('status')
                  ->whereHas('status', fn($s) => $s->whereIn('name', ['published', 'live']))
                  ->where('event_date', '>=', now())
                  ->orderBy('event_date');
            }
        ])->findOrFail($id);

        if (!$artist->hasRole('artist')) {
            return response()->json(['error' => true, 'message' => 'El usuario no es un artista'], 404);
        }

        $data = $artist->toArray();
        $data['total_followers'] = $artist->followers()->count();
        $data['is_following'] = $currentUserId
            ? $artist->followers()->where('user_id', $currentUserId)->exists()
            : false;

        return response()->json([
            'error' => false,
            'message' => 'Perfil del artista recuperado',
            'data' => $data,
        ]);
    }

    /**
     * Estadísticas del artista logueado: audiencia (seguidores totales y nuevos
     * del último mes) e impacto de sus eventos (creados, próximos, inscripciones,
     * likes, desglose por estado y evento más popular). Solo para artistas.
     */
    public function statistics(Request $request)
    {
        $artist = $request->user();
        if (!$artist->hasRole('artist')) {
            return response()->json(['error' => true, 'message' => 'Solo los artistas tienen estadísticas.'], 403);
        }

        // Audiencia
        $totalFollowers        = $artist->followers()->count();
        $newFollowersThisMonth = $artist->followers()
            ->wherePivot('created_at', '>=', now()->subDays(30))
            ->count();

        // Todos los eventos del artista en una sola query
        $artistEvents = Event::where('user_id', $artist->id)
            ->with('status')
            ->withCount(['attendees', 'likedBy'])
            ->get();

        $totalInscriptions = $artistEvents->sum('attendees_count');
        $totalLikes        = $artistEvents->sum('liked_by_count');
        $upcomingEvents    = $artistEvents->filter(fn($e) => $e->event_date > now())->count();

        // Evento más popular por número de inscripciones
        $topEvent         = $artistEvents->sortByDesc('attendees_count')->first();
        $mostPopularEvent = $topEvent ? [
            'id'           => $topEvent->id,
            'title'        => $topEvent->title,
            'inscriptions' => $topEvent->attendees_count,
            'likes'        => $topEvent->liked_by_count,
        ] : null;

        // Desglose por estado
        $eventsByStatus = $artistEvents
            ->groupBy(fn($e) => $e->status->name ?? 'unknown')
            ->map->count()
            ->toArray();

        $stats = [
            'audience' => [
                'total_followers'            => $totalFollowers,
                'new_followers_last_30_days' => $newFollowersThisMonth,
            ],
            'events_impact' => [
                'total_events_created' => $artistEvents->count(),
                'upcoming_events'      => $upcomingEvents,
                'total_inscriptions'   => $totalInscriptions,
                'total_likes'          => $totalLikes,
                'events_by_status'     => $eventsByStatus,
                'most_popular_event'   => $mostPopularEvent,
            ],
        ];

        return response()->json([
            'error'   => false,
            'message' => 'Estadísticas generadas con éxito',
            'data'    => $stats,
        ], 200);
    }
}