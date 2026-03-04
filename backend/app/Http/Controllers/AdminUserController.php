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
        if(Auth::user()->role !== 'admin'){
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
}
