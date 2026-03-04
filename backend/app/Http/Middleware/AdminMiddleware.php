<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        //Verificamos que el usuario esté autenticado y que tenga el rol de 'admin' antes de permitir el acceso a las rutas protegidas por este middleware.
        if(!Auth::check() ||  !Auth::user()->hasRole('admin')){
            //Si la petición viene de Postman o React, devolvemos un error 403 Forbidden en formato JSON.
            if($request->expectsJson() || $request->header('X-Inertia')){
                return response()->json(['message'=>'Acceso denegado. Se requieren permisos de administración.'], 403);
            }

            //Si la petición viene de un navegador
            abort(403, 'Acceso denegado. Se requieren permisos de administración.');
        }
        return $next($request);
    }
}
