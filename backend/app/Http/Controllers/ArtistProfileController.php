<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ArtistProfileController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'bio'=>'nullable|string|max:1000',
            'spotify_url'=>'nullable|url|max:255',
            'instagram_url'=>'nullable|url|max:255',
            'youtube_url'=>'nullable|url|max:255',
            'tiktok_url'=>'nullable|url|max:255',
            'donation_url'=>'nullable|url|max:255', 
        ]);
        // 2. Recogemos al usuario que está logueado en este momento.
        $user = Auth::user();

        if($user->role !== 'artist' || !$user->artistProfile){
            abort(403, 'Acceso denegado. No eres un artista.');
        }

        $user->artistProfile->update([
            'bio' => $request->bio,
            'spotify_url' =>$request->spotify_url,
            'instagram_url'=>$request->instagram_url,
            'youtube_url'=>$request->youtube_url,
            'tiktok_url'=>$request->tiktok_url,
            'donation_url'=>$request->donation_url
        ]);
        // 5. Le devolvemos a la página anterior (React interceptará esto y mostrará éxito).
        return back();
    }
}
