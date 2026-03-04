<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ArtistProfile;
use \App\Models\Event;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        if(!Auth::user()->hasRole('admin')){
            if($request->is('api/*') || $request->expectsJson()){
                return response()->json(['error' => true, 'message' => 'Solo los administradores pueden acceder a esta sección.', 'code' => 403], 403);
            }
            abort(403, 'Solo los administradores pueden acceder a esta sección.');
        }

        //Cambiar más adelante a paginate para no cargar todos los usuarios de golpe.
        $users = User::with(['roles', 'artistProfile'])->get();

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Lista de usuarios recuperada', 'data' => $users, 'code' => 200], 200);
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

    public function update(Request $request, $id){
         $user = User::findOrFail($id);

       $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => 'sometimes|string|in:admin,artist,spectator' // Validamos que el rol exista
        ]);

        DB::transaction(function () use ($user, $request) {
            // Actualizamos los datos básicos
            $user->update($request->only(['name', 'surname', 'email']));

            // Si el admin ha mandado un rol nuevo, usamos Spatie para cambiarlo
            if ($request->has('role')) {
                $newRole = $request->role;
                // syncRoles borra el rol anterior y le pone el nuevo
                $user->syncRoles([$newRole]); 

                //creamos la tabla de artista si el nuevo rol es artist y no tiene perfil de artista.
                if($newRole === 'artist' && !$user->artistProfile){
                    ArtistProfile::create([
                        'user_id' => $user->id,
                    ]);
                }
            }
        });

        $user->load(['roles', 'artistProfile']); // Recargamos las relaciones para que el frontend tenga la info actualizada.
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

    public function destroy(Request $request, $id){
        $user = User::findOrFail($id);

        if($user->id === Auth::id()){
            return response()->json(['error' => true, 'message' => 'No puedes borrarte a ti mismo', 'code' => 403], 403);
        }

        DB::transaction(function () use ($user) {
            if ($user->artistProfile) {
                $user->artistProfile()->delete();
            }
            $user->following()->detach(); 
            $user->followers()->detach(); 
            $user->events()->detach(); 
            Event::where('user_id', $user->id)->delete();

            $user->delete();
        });

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Usuario eliminado por el administrador', 'code' => 200], 200);
        }

        return back();
    }
}
