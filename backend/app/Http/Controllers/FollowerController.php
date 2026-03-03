<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FollowerController extends Controller
{
//Gracias a que los modelos heredan de Eloquent podemos usar métodos como findOrFail, belongsToMany, syncWithoutDetaching o detach para gestionar las relaciones entre usuarios y artistas de forma sencilla, sin tener que escribir consultas SQL manualmente.

    //Muestra la lista de artistas a los que sigue el usuario actual.
    public function index(): Response
    {
        //Usamos with para traernos también la información del perfil del artista desde la tabla artidt_profiles, así en el frontend tenemos toda la info que necesitamos para mostrar la lista de favoritos.
        $favorites = Auth::user()->following()->with('artistProfile')->get();

        //Devolvemos la lista de favoritos a la vista de React.
        return Inertia::render('Profile/Favorites', ['favorites' => $favorites]);
    }

    //El usuario que ya esta registrado empieza a seguir a un artista.
    public function store($id): RedirectResponse
    {
        $artist = User::findOrFail($id);

        //Verificamos que el usuario a quien quiere seguir sea un artista.
        if($artist->role !== 'artist'){
            abort(403, 'Solo puedes seguir a artistas.');
        }

        //Asociamos las ID en la tabla pivote follows, usamos syncWithoutDetaching para no eliminar los seguimientos anteriores del usuario y también el problema de duplicados o que salte un error 500 de SQL por culpa del unique.
        Auth::user()->following()->syncWithoutDetaching([$id]);

        //Volvemos a la página anterior (en este caso el perfil del artista) después de seguirlo.
        return back();
    }

    //El usuario deja de seguir al artista.
    public function destroy($id): RedirectResponse
    {
        //Elimina la relación de seguimiento entre el usuario y el artista en la tabla pivote follows.
        Auth::user()->following()->detach($id);
        return back();
    }
}
