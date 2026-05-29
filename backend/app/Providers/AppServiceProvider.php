<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // En producción forzamos HTTPS al generar URLs. Railway sirve detrás de
        // un proxy, así que sin esto las URLs firmadas (verificación de correo)
        // se generan en http y la firma no valida al llegar por https.
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
