<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //MIDDLEWARE QUE SE EJECUTA EN TODAS LAS RUTAS
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'is_artist' => \App\Http\Middleware\CheckArtist::class,
        ]);
        // Excepción para probar con Postman ------------>> TODO: QUITAR EN PRODUCCIÓN.
        $middleware->validateCsrfTokens(except: [
            'event/create',
            'event/*'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
