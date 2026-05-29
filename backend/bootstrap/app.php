<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //MIDDLEWARE QUE SE EJECUTA EN TODAS LAS RUTAS
        $middleware->web(append: [
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        // IMPORTANTE: Habilitar CORS para que React (ej: localhost:5173)
        // pueda hablar con Laravel (ej: localhost:8000)
        $middleware->statefulApi();

        // Confiamos en el proxy del hosting (Railway). Sin esto Laravel ve la
        // petición como http en vez de https y las URLs firmadas (verificación
        // de correo) fallan al validar la firma.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'artist' => \App\Http\Middleware\IsArtist::class,
        ]);

        // Excepción para probar con Postman.
        /*$middleware->validateCsrfTokens(except: [
            'event/*'
        ]); */


    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Forzamos respuesta JSON en cualquier error bajo /api/* (validación,
        // fallo de BD, 404...) para que el SPA siempre reciba JSON y no HTML.
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
    })->create();
