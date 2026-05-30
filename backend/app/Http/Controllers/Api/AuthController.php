<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use \App\Models\ArtistProfile;
use Illuminate\Support\Facades\DB;

/**
 * Autenticación vía API con tokens de Sanctum (login, registro, logout).
 * El SPA de React guarda el token y lo manda como Bearer en cada petición.
 */
class AuthController extends Controller
{
    /**
     * Login: valida credenciales y devuelve un token Sanctum si son correctas.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        //Intentamos loguear al usuario
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                "error" => true,
                "message" => 'No se ha podido autenticar el usuario',
                "code" => 401 
            ], 401);
        }

        // Credenciales correctas: recuperamos el usuario.
        $usuario = Auth::user();

        // Bloqueo por verificación: si no ha confirmado el correo, no le damos
        // token. El frontend mostrará el aviso y el botón de reenviar.
        if (! $usuario->hasVerifiedEmail()) {
            return response()->json([
                "error"              => true,
                "message"            => 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja (y la carpeta de spam).',
                "needs_verification" => true,
                "email"              => $usuario->email,
                "code"               => 403,
            ], 403);
        }

        // Verificado: le emitimos el token Sanctum.
        $token = $usuario->createToken('auth_token')->plainTextToken;

        //Devolvemos el JSON 
        return response()->json([
            "error" => false,
            "message" => 'Usuario autenticado correctamente',
            "token" => $token,
            "type_token" => "Bearer",
            "role" => $usuario->roles->pluck('name')->first(), //Obtenemos el nombre del rol del usuario (asumiendo que solo tiene un rol)
            "code" => 200
        ], 200);
    }

    public function register(Request $request)
    {
        $trustedDonationDomains = [
            'ko-fi.com', 'buymeacoffee.com', 'paypal.com', 'paypal.me',
            'patreon.com', 'gofundme.com', 'stripe.com', 'twitch.tv',
            'streamlabs.com', 'github.com', 'opencollective.com',
        ];

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'donation_url' => [
                'nullable', 'url', 'max:255',
                function ($attribute, $value, $fail) use ($trustedDonationDomains) {
                    if (!$value) return;
                    $host = strtolower(parse_url($value, PHP_URL_HOST) ?? '');
                    $host = ltrim($host, 'www.');
                    foreach ($trustedDonationDomains as $domain) {
                        if ($host === $domain || str_ends_with($host, '.' . $domain)) return;
                    }
                    $fail('La URL de donación debe ser de una plataforma de confianza: Ko-fi, Buy Me a Coffee, PayPal, Patreon, GoFundMe, Stripe o Twitch.');
                },
            ],
            // Móvil para Bizum (opcional): móvil español de 9 dígitos (6/7).
            'bizum_phone' => [
                'nullable', 'string', 'max:20',
                function ($attribute, $value, $fail) {
                    if (!$value) return;
                    $digits = preg_replace('/\D/', '', $value);
                    if (strlen($digits) === 11 && str_starts_with($digits, '34')) {
                        $digits = substr($digits, 2);
                    }
                    if (!preg_match('/^[67]\d{8}$/', $digits)) {
                        $fail('El número de Bizum debe ser un móvil español válido (9 dígitos, empieza por 6 o 7).');
                    }
                },
            ],
        ]);

        $user = DB::transaction(function () use ($request) {
            $newUser = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $secureRole = ($request->role === 'artist') ? 'artist' : 'spectator';
            $newUser->assignRole($secureRole);

            if ($secureRole === 'artist') {
                ArtistProfile::create([
                    'user_id'      => $newUser->id,
                    'donation_url' => $request->filled('donation_url') ? $request->donation_url : null,
                    'bizum_phone'  => $request->filled('bizum_phone') ? $request->bizum_phone : null,
                ]);
            }

            return $newUser;
        });

        // Le mandamos el correo de verificación. NO le damos token: primero
        // tiene que confirmar el correo pinchando el enlace que le llega.
        $user->sendEmailVerificationNotification();

        return response()->json([
            "error"              => false,
            "message"            => 'Te hemos enviado un correo para confirmar tu cuenta. Revisa tu bandeja de entrada.',
            "needs_verification" => true,
            "email"              => $user->email,
            "code"               => 201,
        ], 201);
    }

    public function logout(){

        if (!Auth::user()->tokens()->delete()) {
            return response([
                "error"=>true,
                "message"=>'No se ha podido hacer logout del usuario',
                "code"=>403
            ],403);
        }else{
            return response([
                "error"=>false,
                "message"=>'Cierre de sesión correcto',
                "code"=>200
            ],200);
        }
    }
}
