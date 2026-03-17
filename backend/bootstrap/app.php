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
        // Lo que puso tu compañera está bien encaminado.
        // Laravel 11/12 ya maneja mucho esto, pero forzar JSON en API es ley.
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });
    })->create();

/**
 * 3. Excepciones: ¿Por qué así y no como tu compañera?
 * ----------------------------------------------------
 * Te lo aclaro rápido:
 * El código de tu compañera era un "parche" (renderizar manualmente cada tipo de error).
 * Mi propuesta en bootstrap/app.php con shouldRenderJsonWhen es una "configuración de motor"
 * Si usas mi método, Laravel dice: "Ah, ¿esta petición va a /api/*?
 * Entonces, pase lo que pase (un error de validación, un fallo de conexión a Postgres,
 * o un archivo que no existe), voy a escupir un JSON automáticamente". No tienes que programar cada excepción una a una. Es eficiencia pura.
 */
