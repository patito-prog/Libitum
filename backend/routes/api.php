<?php

use App\Http\Controllers\StatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;

// --- RUTA PÚBLICA (No necesita token, porque venimos a pedirlo) ---
Route::post('/login', [AuthController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/events/{event}', [EventController::class, 'show']); //  ARTISTA/USUARIO puede ver un evento.
// Cualquiera puede ver el perfil de un artista.
Route::get('/artists/{id}', [ArtistProfileController::class, 'show']);

Route::get('/categories',[CategoryController::class, 'index']); // Recoger todas las categorías que existen (básicamente para rellenar dinámicamente el select de categorías)
Route::get('/statuses', [StatusController::class, 'index']); // Recoge todos los estados que existen en la base de datos.

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


        //  CRUD de Eventos del Artista.

        Route::get('/events', [EventController::class, 'index']); //  Artista puede ver sus eventos.
        Route::post('/events', [EventController::class, 'store']); //  Artista crea un evento.
        Route::put('/events/{event}',[EventController::class, 'update']); //  Artista edita un evento.
        Route::delete('/events/{event}',[EventController::class, 'destroy']); //  Artista elimina un evento.

        //Acciones específicas de eventos.
        Route::put('/events/{event}/categories', [EventController::class, 'categories']); //  Artista asigna/edita categorías de un evento.
        Route::patch('/events/{event}/status', [EventController::class, 'status']); //  Artista cambia el estado de un evento.
    }); // -----------------    TERMINA EL MIDDLEWARE `artist`   --------------------------

    Route::middleware('admin')->group(function () {
        // Ver todos los usuarios
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    }); // -----------------    TERMINA EL MIDDLEWARE `admin`   --------------------------


    //  --- ACCIONES DEL ESPECTADOR ---

    Route::get('/user/events', [EventController::class, 'signedUp']); //  Usuario puede ver a qué eventos está inscrito.
    Route::post('/user/event', [EventController::class, 'inscription']); //  Usuario puede inscribirse en un evento.
    Route::patch('/user/{event}/remind_me', [EventController::class, 'remindMe']); //  Usuario puede desactivar/activar que se le RECUERDE el evento. (Por predeterminado se le RECUERDA el evento).
    Route::delete('/user/{event}/', [EventController::class, 'destroySignedUp']); //  Usuario puede darse de baja de un evento.

});// -----------------    TERMINA EL MIDDLEWARE `auth:sanctum`   --------------------------
