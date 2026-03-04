<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use \App\Models\ArtistProfile;

class AuthController extends Controller
{
    public function verify(Request $request)
    {
        //Validamos que nos manden email y contraseña
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

        //Si todo va bien, sacamos al usuario y le creamos el token
        $usuario = Auth::user();
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
        // 1. Validamos los datos que nos envían por Postman
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        //Creamos el usuario en la base de datos
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $secureRole = ($request->role === 'artist') ? 'artist' : 'spectator';
        $user->assignRole($secureRole);
        if ($secureRole === 'artist') {
            //Creamos el perfil de artista vacío para que el artista pueda editarlo después. Es importante crear el perfil de artista en el momento del registro, para evitar problemas de integridad referencial y para que el frontend siempre tenga un perfil de artista asociado al usuario, aunque esté vacío.
            ArtistProfile::create([
                'user_id' => $user->id,
            ]);
        }
        // 3. Le generamos el token directamente para que ya esté logueado
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Devolvemos el JSON de éxito
        return response()->json([
            "error" => false,
            "message" => 'Usuario registrado correctamente',
            "token" => $token,
            "type_token" => "Bearer",
            "code" => 201
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
