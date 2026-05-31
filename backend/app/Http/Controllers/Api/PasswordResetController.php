<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * Recuperación de contraseña por correo ("olvidé mi contraseña").
 *
 * Usa el "Password Broker" de Laravel, que se encarga de generar y validar el
 * token contra la tabla password_reset_tokens. Nosotros solo exponemos los dos
 * endpoints públicos y adaptamos las respuestas a JSON para el SPA.
 */
class PasswordResetController extends Controller
{
    /**
     * Paso 1: el usuario pide el enlace. Generamos el token y le enviamos el
     * correo. Respondemos siempre igual (aunque el email no exista) para no
     * revelar qué correos están registrados.
     */
    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // sendResetLink crea el token, lo guarda y dispara la notificación.
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'error'   => false,
            'message' => 'Si el correo está registrado, te hemos enviado un enlace para restablecer tu contraseña.',
        ]);
    }

    /**
     * Paso 2: el usuario llega con el token (del enlace) y la nueva contraseña.
     * El broker valida el token y, si es correcto, ejecutamos el cambio.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
                // Por seguridad, invalidamos las sesiones (tokens) anteriores.
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'error'   => false,
                'message' => 'Tu contraseña se ha actualizado. Ya puedes iniciar sesión.',
            ]);
        }

        // Token inválido o caducado, o email que no coincide.
        return response()->json([
            'error'   => true,
            'message' => 'El enlace no es válido o ha caducado. Vuelve a solicitar el cambio.',
        ], 422);
    }
}
