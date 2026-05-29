<?php

/*
 * Configuración de CORS.
 *
 * Usamos autenticación por TOKEN (Sanctum Bearer en localStorage), no por
 * cookies, así que NO necesitamos credenciales en CORS y podemos permitir
 * cualquier origen para las rutas de API. El front (Vercel) y el back (Railway)
 * viven en dominios distintos, por eso esto tiene que estar bien.
 */

return [
    // Rutas a las que se aplica CORS.
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // Token-based: permitimos cualquier origen. Si algún día se pasa a auth por
    // cookie, habría que listar aquí los dominios concretos y poner credentials a true.
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false porque no mandamos cookies; el token va en la cabecera Authorization.
    'supports_credentials' => false,
];
