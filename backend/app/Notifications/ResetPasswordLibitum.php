<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Config;

/**
 * Correo de "restablecer contraseña" con la marca Libitum.
 *
 * Extiende la notificación de Laravel pero apunta el enlace a NUESTRO frontend
 * (no a una ruta web del backend), porque la app es un SPA. El enlace lleva el
 * token y el email como parámetros para que la página de restablecer los use.
 */
class ResetPasswordLibitum extends BaseResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $base = rtrim(Config::get('app.frontend_url', 'http://localhost:5173'), '/');
        // El token lo genera el broker de Laravel; lo metemos en la URL del frontend.
        $url  = "{$base}/restablecer-contrasena?token={$this->token}&email=" . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Restablecer tu contraseña · Libitum')
            ->view('emails.reset-password', [
                'url'   => $url,
                'user'  => $notifiable,
                'count' => Config::get('auth.passwords.users.expire', 60),
            ]);
    }
}
