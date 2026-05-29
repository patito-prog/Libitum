<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

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

        // Transporte de correo Brevo por API HTTP (puerto 443). Lo usamos porque
        // Railway bloquea el SMTP saliente, así que Gmail/SMTP se quedaban colgados.
        // Se activa con MAIL_MAILER=brevo (ver config/mail.php).
        Mail::extend('brevo', function (array $config) {
            return (new BrevoTransportFactory())->create(
                new Dsn('brevo+api', 'default', $config['key'] ?? '')
            );
        });
    }
}
