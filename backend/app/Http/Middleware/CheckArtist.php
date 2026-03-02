<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckArtist
{
    /**
     * Función que verifica si es un artista.
     *
     * IMPORTANTE:
     * Middleware para que principalmente se use en rutas que deban solo acceder los artistas. Así nos aseguramos que se cumpla la seguridad antes de qeu la petición llegue al controlador.
     *
     * PARA SU USO EN ROUTES:
     *  - 'is_artist'
     *  - Se puede ver reflejado en bootstrap/app.php
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->user()?->role !== 'artist') {
            abort(403, 'No eres un artista.');
        }
        return $next($request);
    }
}
