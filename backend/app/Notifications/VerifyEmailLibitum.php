<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * Notificación de verificación de correo con la marca Libitum.
 *
 * Extiende la de Laravel pero cambia dos cosas:
 *  - El email usa nuestra plantilla Blade (emails.verify) con el diseño de la web.
 *  - El enlace es una URL FIRMADA y temporal que apunta al backend; al pincharla
 *    se marca el correo como verificado y se redirige al frontend.
 */
class VerifyEmailLibitum extends BaseVerifyEmail
{
    /** Construye el email a partir de nuestra vista de marca. */
    public function toMail($notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Confirma tu correo · Libitum')
            ->view('emails.verify', [
                'url'  => $url,
                'user' => $notifiable,
            ]);
    }

    /**
     * Genera la URL firmada temporal hacia la ruta de verificación del backend.
     * Caduca a los 60 minutos (configurable en auth.verification.expire).
     */
    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'api.verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}
