<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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

        $users = User::all();

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Lista de usuarios recuperada', 'data' => $users, 'code' => 200], 200);
        }

        return Inertia::render('Admin/Users', ['users' => $users]);
    }

    public function show(Request $request, $id){
        $user = User::findOrFail($id);

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Usuario recuperado', 'data' => $user, 'code' => 200], 200);
        }
        return Inertia::render('Admin/UserDetail', ['user' => $user]);
    }

    public function update(Request $request, $id){
        $user = User::findOrFail($id);

       $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => 'sometimes|string|in:admin,artist,spectator' // Validamos que el rol exista
        ]);

        // Actualizamos los datos básicos
        $user->update($request->only(['name', 'surname', 'email']));

        // Si el admin ha mandado un rol nuevo, usamos Spatie para cambiarlo
        if ($request->has('role')) {
            // syncRoles borra el rol anterior y le pone el nuevo
            $user->syncRoles([$request->role]); 
        }

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json([
                'error' => false, 
                'message' => 'Usuario actualizado correctamente', 
                'data' => $user, 
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

        $user->delete();

        if($request->is('api/*') || $request->expectsJson()){
            return response()->json(['error' => false, 'message' => 'Usuario eliminado por el administrador', 'code' => 200], 200);
        }

        return back();
    }
}
