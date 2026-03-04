<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use \App\Models\Event;
use Inertia\Inertia;

class ArtistProfileController extends Controller
{
   
    public function update(Request $request)
    {
        $request->validate([
            'bio'=>'nullable|string|max:1000',
            'spotify_url'=>'nullable|url|max:255',
            'instagram_url'=>'nullable|url|max:255',
            'youtube_url'=>'nullable|url|max:255',
            'tiktok_url'=>'nullable|url|max:255',
            'donation_url'=>'nullable|url|max:255', 
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
        $artist = User::with(['artistProfile', 'events'])->findOrFail($id);

        if (!$artist->hasRole('artist')) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['error' => true, 'message' => 'El usuario no es un artista', 'code' => 404], 404);
            }
            abort(404, 'Artista no encontrado');
        }

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Perfil del artista recuperado',
                'data' => $artist,
                'code' => 200
            ], 200);
        }

        return \Inertia\Inertia::render('Artist/Profile', ['artist' => $artist]);
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