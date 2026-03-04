<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\ProfileController;

// --- RUTA PÚBLICA (No necesita token, porque venimos a pedirlo) ---
Route::post('/login', [AuthController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);
// --- RUTAS PROTEGIDAS (Necesitan el token de Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    
    //La ruta por defecto de Laravel
    Route::get('/user', function (Request $request) {
        //carga todo lo relacionado con el perfil de artista, para que cuando el frontend pida los datos del usuario, ya tenga toda la info del perfil de artista (si es que tiene).
        $user = $request->user()->load('artistProfile');
        $userData = $user->toArray();
        //Obtenemos el rol del usuario para poder verlo.
        $userData['role']=$user->getRoleNames()->first() ?? 'spectator'; 
        return response()->json([
            'error' => false,
            'message' => 'Token válido',
            'data' => $userData
        ], 200);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy']);
    
    Route::get('/artists/{id}', [ArtistProfileController::class, 'show']);
    
    // Rutas de seguidores para la API
    Route::get('/my-favorites', [FollowerController::class, 'index']);
    Route::post('/artist/{id}/follow', [FollowerController::class, 'store']);
    Route::delete('/artist/{id}/unfollow', [FollowerController::class, 'destroy']);

    Route::middleware('artist')->group(function () {
        Route::patch('/artist-profile', [ArtistProfileController::class, 'update']);
        Route::get('/my-followers', [FollowerController::class, 'followers']);
        Route::get('/artist/statistics', [ArtistProfileController::class, 'statistics'])->name('artist.statistics');

    });

    Route::middleware('admin')->group(function () {        
        // Ver todos los usuarios
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/admin/users/{id}', [AdminUserController::class, 'update']); 
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']); 
    });
    
});