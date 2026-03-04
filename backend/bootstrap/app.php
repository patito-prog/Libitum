<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
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
        //
    })->create();
