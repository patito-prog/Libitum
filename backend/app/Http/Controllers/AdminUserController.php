<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ArtistProfile;
use \App\Models\Event;

/**
 * Gestión de usuarios desde el panel de administración.
 * Listar (con búsqueda y paginación), ver, cambiar rol y eliminar usuarios.
 * Todos los métodos comprueban que quien llama es admin.
 */
class AdminUserController extends Controller
{
    /** Lista usuarios paginados, con búsqueda opcional por nombre o email. */
    public function index(Request $request)
    {
        if(!Auth::user()->hasRole('admin')){
            if($request->is('api/*') || $request->expectsJson()){
                return response()->json(['error' => true, 'message' => 'Solo los administradores pueden acceder a esta sección.', 'code' => 403], 403);
            }
            abort(403, 'Solo los administradores pueden acceder a esta sección.');
        }

        $users = User::with(['roles', 'artistProfile'])
            ->when($request->filled('search'), fn($q) =>
                $q->where(fn($q) =>
                    $q->where('name',  'ilike', '%'.$request->search.'%')
                      ->orWhere('email', 'ilike', '%'.$request->search.'%')
                )
            )
            ->paginate(20);

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'data' => $users], 200);
        }

        return Inertia::render('Admin/Users', ['users' => $users]);
    }

    public function show(Request $request, $id){
        $user = User::with(['roles', 'artistProfile'])->findOrFail($id);
        $roleName = $user->getRoleNames()->first() ?? 'spectator';
        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Usuario recuperado', 'data' => $user, 'role' => $roleName, 'code' => 200], 200);
        }
        return Inertia::render('Admin/UserDetail', ['user' => $user, 'role' => $roleName]);
    }

    /**
     * Actualiza datos y/o rol de un usuario (admin).
     * Va dentro de una transacción para que el cambio de rol y la creación del
     * perfil de artista (si pasa a artista) se hagan de forma atómica.
     *
     * @param int $id Id del usuario
     */
    public function update(Request $request, $id){
         $user = User::findOrFail($id);

       $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => 'sometimes|string|in:admin,artist,spectator'
        ]);

        DB::transaction(function () use ($user, $request) {
            $user->update($request->only(['name', 'surname', 'email']));

            if ($request->has('role')) {
                $newRole = $request->role;
                // syncRoles (Spatie) quita el rol anterior y deja solo el nuevo.
                $user->syncRoles([$newRole]);

                // Si ahora es artista y no tenía perfil, se lo creamos vacío.
                if($newRole === 'artist' && !$user->artistProfile){
                    ArtistProfile::create([
                        'user_id' => $user->id,
                    ]);
                }
            }
        });

        $user->load(['roles', 'artistProfile']); // recargamos relaciones para devolver datos frescos
        $roleName = $user->getRoleNames()->first() ?? 'spectator';

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json([
                'error' => false, 
                'message' => 'Usuario actualizado correctamente', 
                'data' => [
                    'user' => $user,
                    'role_name' => $roleName
                ],
                'code' => 200
            ], 200);
        }

        return back();
    }

    /**
     * Elimina un usuario (admin). No puede borrarse a sí mismo.
     * Dentro de una transacción limpia primero todo lo que cuelga de él
     * (perfil de artista, follows, asistencias y eventos creados) y luego lo borra.
     *
     * @param int $id Id del usuario
     */
    public function destroy(Request $request, $id){
        $user = User::findOrFail($id);

        if($user->id === Auth::id()){
            return response()->json(['error' => true, 'message' => 'No puedes borrarte a ti mismo', 'code' => 403], 403);
        }

        DB::transaction(function () use ($user) {
            if ($user->artistProfile) {
                $user->artistProfile()->delete();
            }
            $user->following()->detach();  // a quién seguía
            $user->followers()->detach();  // quién le seguía
            $user->events()->detach();     // asistencias (pivote event_user)
            Event::where('user_id', $user->id)->delete(); // eventos que creó

            $user->delete();
        });

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Usuario eliminado por el administrador', 'code' => 200], 200);
        }

        return back();
    }
}
