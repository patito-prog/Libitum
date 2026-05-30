<?php

/*
 * Configuración de CORS.
 *
 * Usamos autenticación por TOKEN (Sanctum Bearer en localStorage), no por
 * cookies. Aun así restringimos los orígenes permitidos a nuestro frontend
 * (Vercel) y al desarrollo local, en vez de abrir a cualquiera.
 */

return [
    // Rutas a las que se aplica CORS.
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // Solo nuestro frontend (de FRONTEND_URL) y el desarrollo local.
    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL'),
        'http://localhost:5173',
        'http://localhost:5174',
    ])),

    // Despliegues "preview" de Vercel (subdominios *.vercel.app).
    'allowed_origins_patterns' => ['#^https://[a-z0-9-]+\.vercel\.app$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false porque no mandamos cookies; el token va en la cabecera Authorization.
    'supports_credentials' => false,
];
