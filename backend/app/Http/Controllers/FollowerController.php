<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gestiona la relación de seguimiento entre usuarios y artistas.
 * Se apoya en las relaciones Eloquent following()/followers() del modelo User,
 * así que las altas/bajas son syncWithoutDetaching / detach sobre la pivote 'follows'.
 */
class FollowerController extends Controller
{
    /** Lista los artistas a los que sigue el usuario actual. */
    public function index(Request $request)
    {
        // Cargamos también artistProfile para tener toda la info en el front de una.
        $favorites = Auth::user()->following()->with('artistProfile')->get();

        if($request->expectsJson() || $request->is('api/*')){
            return response()->json([
                'error' => false,
                'message' => 'Lista de favoritos recuperada',
                'data' => $favorites,
                'code' => 200
            ], 200);
        }
        //Devolvemos la lista de favoritos a la vista de React.
        return Inertia::render('Profile/Favorites', ['favorites' => $favorites]);
    }

    /** Lista los seguidores del artista actual (solo si es artista). */
    public function followers(Request $request){
        if(!Auth::user()->hasRole('artist')){
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['error' => true, 'message' => 'Solo los artistas tienen seguidores.', 'code' => 403], 403);
            }
            abort(403, 'Solo los artistas tienen seguidores.');
        }

        $followers = Auth::user()->followers()->get();
        if($request->expectsJson() || $request->is('api/*')){
            return response()->json([
                'error' => false,
                'message' => 'Lista de seguidores recuperada',
                'data' => $followers,
                'code' => 200
            ], 200);
        }
        return Inertia::render('Profile/Followers', ['followers' => $followers]);
    }
    /**
     * El usuario actual empieza a seguir a un artista.
     * @param int $id Id del artista a seguir
     */
    public function store($id, Request $request)
    {
        $artist = User::findOrFail($id);

        // Solo se puede seguir a artistas.
        if(!$artist->hasRole('artist')){
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['error' => true, 'message' => 'Solo puedes seguir a artistas.', 'code' => 403], 403);
            }
            abort(403, 'Solo puedes seguir a artistas.');
        }

        // syncWithoutDetaching evita duplicados (y el 500 por el unique) sin
        // borrar los seguimientos previos del usuario.
        Auth::user()->following()->syncWithoutDetaching([$id]);

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Ahora sigues a ' . $artist->name,
                'code' => 200
            ], 200);
        }
        //Volvemos a la página anterior (en este caso el perfil del artista) después de seguirlo.
        return back();
    }

    /**
     * El usuario actual deja de seguir a un artista.
     * @param int $id Id del artista
     */
    public function destroy($id, Request $request)
    {
        // detach quita la fila de la pivote follows.
        Auth::user()->following()->detach($id);
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Has dejado de seguir al artista',
                'code' => 200
            ], 200);
        }
        return back();
    }
}
