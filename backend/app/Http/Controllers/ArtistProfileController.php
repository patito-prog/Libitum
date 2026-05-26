<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use \App\Models\Event;
use Inertia\Inertia;

class ArtistProfileController extends Controller
{
   
    // Plataformas de pago/donación reconocidas. Solo se permiten URLs de estos dominios
    // para evitar que artistas pongan enlaces fraudulentos que roben a sus seguidores.
    private const TRUSTED_DONATION_DOMAINS = [
        'ko-fi.com', 'buymeacoffee.com', 'paypal.com', 'paypal.me',
        'patreon.com', 'gofundme.com', 'stripe.com', 'twitch.tv',
        'streamlabs.com', 'github.com', 'opencollective.com',
    ];

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
        ]);

        Auth::user()->artistProfile->update([
            'bio' => $request->bio,
            'spotify_url' =>$request->spotify_url,
            'instagram_url'=>$request->instagram_url,
            'youtube_url'=>$request->youtube_url,
            'tiktok_url'=>$request->tiktok_url,
            'donation_url'=>$request->donation_url
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

    public function show(Request $request, $id){
        $currentUserId = Auth::id();

        $artist = User::with([
            'artistProfile',
            'events' => function ($q) {
                $q->with('status')
                  ->whereHas('status', fn($s) => $s->whereIn('name', ['published', 'live']))
                  ->latest();
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

    //Esta función hay que ir ampliándola poco a poco, porque es la más compleja de todas. Aquí se irán añadiendo estadísticas y gráficos para que el artista pueda ver el impacto que tiene su perfil y sus eventos en la plataforma.
    public function statistics(Request $request){
        $artist = $request->user();
        if (!$artist->hasRole('artist')) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['error' => true, 'message' => 'Solo los artistas tienen estadísticas.', 'code' => 403], 403);
            }
            abort(403, 'Solo los artistas tienen estadísticas.');
        }

        $totalFollowers = $artist->followers()->count();

        $newFollowersThisMonth = $artist->followers()
            ->wherePivot('created_at', '>=', now()->subDays(30))
            ->count();

        $totalEvents = Event::where('user_id', $artist->id)->count();

        $stats = [
            'audience' => [
                'total_followers' => $totalFollowers,
                'new_followers_last_30_days' => $newFollowersThisMonth,
            ],
            'events_impact' => [
                'total_events_created' => $totalEvents,
            ]
        ];

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Estadísticas generadas con éxito',
                'data' => $stats,
                'code' => 200
            ], 200);
        }

        return Inertia::render('Artist/Statistics', ['stats' => $stats]);
    }
}