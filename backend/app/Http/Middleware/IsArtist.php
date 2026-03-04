<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class IsArtist
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //  Dentro del if ---> || !Auth::user()->artistProfile
        // ToDo: Un trigger cuando el usuario se registra como artista se crea un registro en la tabla artist_profiles con todo null(vacío).
        if (Auth::user()->role !== 'artist') {
            //Si la petición viene de Postman o React, devolvemos un error 403 Forbidden en formato JSON.
            if($request->expectsJson() || $request->header('X-Inertia')){
                return response()->json(['message'=>'Acceso denegado. Solo para artistas.'], 403);
            }

            //Si la petición viene de un navegador
            abort(403, 'Acceso denegado. Solo para artistas.');
        }
        return $next($request);
    }
}
