<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\ProfileController;

// --- RUTA PÚBLICA (No necesita token, porque venimos a pedirlo) ---
Route::post('/login', [AuthController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);
//  ARTISTA/USUARIO puede ver un evento.
Route::get('/event/{event}', [EventController::class, 'show']);
// Cualquiera puede ver el perfil de un artista.
Route::get('/artists/{id}', [ArtistProfileController::class, 'show']);

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

    

    // Rutas de seguidores para la API
    Route::get('/my-favorites', [FollowerController::class, 'index']);
    Route::post('/artist/{id}/follow', [FollowerController::class, 'store']);
    Route::delete('/artist/{id}/unfollow', [FollowerController::class, 'destroy']);

    Route::middleware('artist')->group(function () {
        Route::patch('/artist-profile', [ArtistProfileController::class, 'update']);
        Route::get('/my-followers', [FollowerController::class, 'followers']);
        Route::get('/artist/statistics', [ArtistProfileController::class, 'statistics'])->name('artist.statistics');


        //  Artista puede ver sus eventos.
        Route::get('/event', [EventController::class, 'index']);
        //  Artista crea un evento.
        Route::post('/event/create', [EventController::class, 'store']);
        //  Artista edita un evento.
        Route::put('/event/{event}',[EventController::class, 'update']);
        //  Artista elimina un evento.
        Route::delete('/event/{event}',[EventController::class, 'destroy']);
        //  Artista asigna/edita categorías de un evento.
        Route::put('/event/{event}/categories', [EventController::class, 'categories']);
        //  Artista cambia el estado de un evento.
        Route::patch('/event/{event}/status', [EventController::class, 'status']);
    }); // -----------------    TERMINA EL MIDDLEWARE `artist`   --------------------------

    Route::middleware('admin')->group(function () {
        // Ver todos los usuarios
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    }); // -----------------    TERMINA EL MIDDLEWARE `admin`   --------------------------


    //  RUTAS EN EVENTOS PARA LOS USUARIOS/ESPECTADORES.
    //  Usuario puede inscribirse en un evento.
    Route::post('/user/event', [EventController::class, 'inscription']);
    //  Usuario puede ver a qué eventos está inscrito.
    Route::get('/user/events', [EventController::class, 'signedUp']);
    //  Usuario puede desactivar/activar que se le RECUERDE el evento. (Por predeterminado se le RECUERDA el evento).
    Route::patch('/user/{event}/remind_me', [EventController::class, 'remindMe']);
    //  Usuario puede darse de baja de un evento.
    Route::delete('/user/{event}/', [EventController::class, 'destroySignedUp']);

});// -----------------    TERMINA EL MIDDLEWARE `auth:sanctum`   --------------------------
