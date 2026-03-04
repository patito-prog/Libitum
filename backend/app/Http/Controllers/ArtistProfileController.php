<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
}