<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Config;

/**
 * Verificación de correo para el SPA.
 *
 * El flujo: el usuario pincha el enlace firmado que le llega por email →
 * cae en verify() (backend) → se marca el correo como verificado → se le
 * redirige a una página bonita del frontend (/email-verificado).
 */
class EmailVerificationController extends Controller
{
    /** URL del frontend a la que redirigimos tras verificar. */
    private function frontend(string $status): string
    {
        $base = rtrim(Config::get('app.frontend_url', 'http://localhost:5173'), '/');
        return "{$base}/email-verificado?status={$status}";
    }

    /**
     * Verifica el correo. La ruta va firmada (middleware 'signed'), así que si
     * la firma es válida sabemos que el enlace es legítimo y no ha caducado.
     */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::find($id);

        // El hash debe coincidir con el email del usuario (evita que cambien la id).
        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect()->away($this->frontend('error'));
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->away($this->frontend('already'));
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return redirect()->away($this->frontend('success'));
    }

    /**
     * Reenvía el correo de verificación. Es público (el usuario aún no puede
     * loguearse) pero va con throttle. Siempre responde igual para no revelar
     * qué correos existen.
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'error'   => false,
            'message' => 'Si el correo existe y no está verificado, te hemos enviado un nuevo enlace.',
        ]);
    }
}
