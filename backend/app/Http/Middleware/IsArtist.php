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
        if (!Auth::user()->hasRole('artist') || !Auth::user()->artistProfile) {
            //Si la petición viene de Postman o React, devolvemos un error 403 Forbidden en formato JSON.
            if($request->expectsJson() || $request->is('api/*')){
                return response()->json(['message'=>'Acceso denegado. Solo para artistas.'], 403);
            }

            //Si la petición viene de un navegador
            abort(403, 'Acceso denegado. Solo para artistas.');
        }
        return $next($request);
    }
}
