<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        //Queremos que el usuario se devuleva completo, con su perfil de artista si es artista y su rol por si hace falta acceder a el en el frontend.
        $user = $request->user();
        $userData = null;
        if($user){
            //Obtenemos el perfil del artista si lo tiene.
            $user->load('artistProfile');
            $userData = $user->toArray();
            //Obtenemos el rol del usuario para poder verlo.
            $userData['role']=$user->getRoleNames()->first() ?? 'spectator';
        }
        return [
            ...parent::share($request),
            'auth' => [
                //CUALQUIER componente de React que programes, puedes acceder a toda la información del artista sin hacer ninguna petición al servidor.
                'user' => $userData,
            ],
        ];
    }
}
