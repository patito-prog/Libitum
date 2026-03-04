<?php

use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\AdminUserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

//PETICIÓN CON NO-AUTENTICACIÓN.
//  ARTISTA/USUARIO puede ver un evento. (CONSIDERO QUE NO HACE FALTA QUE SE AUTENTIQUE PARA ESTO)
Route::get('/event/{event}', [EventController::class, 'show'])->name('event.show');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    //Gestión básica del perfil de usuario (edit, update, destroy).
    // Muestra el formulario para editar los datos básicos de la cuenta (Nombre, Email, Contraseña).
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Actualiza la información básica de la cuenta en la tabla 'users'.
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Borra permanentemente la cuenta del usuario de la base de datos.
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/artists/{id}', [ArtistProfileController::class, 'show'])->name('artists.show');
    //Rutas de perfil de artista (name sirve para ponerle un nombre a la ruta, así luego en React podemos usar ese nombre para hacer la petición, en vez de poner la URL completa).


    //Rutas favoritos / seguidores.
    //Recupera y muestra la lista de artistas a los que sigue el usuario actual.
    Route::get('/my-favorites', [FollowerController::class, 'index'])->name('followers.index');
    // Crea una nueva relación de seguimiento entre el usuario y un artista.
    Route::post('/artist/{id}/follow', [FollowerController::class, 'store'])->name('followers.store');
    //Dejar de seguir al artista.
    Route::delete('/artist/{id}/unfollow', [FollowerController::class, 'destroy'])->name('followers.destroy');


    //------------------EVENTOS PARA LOS USUARIOS/ESPECTADORES---------------------------.
    //  Usuario puede inscribirse en un evento.
    Route::post('/user/event', [EventController::class, 'inscription'])->name('event.inscription');
    // Usuario puede ver a qué eventos está inscrito.
    Route::get('/user/events', [EventController::class, 'signedUp'])->name('event.signedUp');
    // Usuario puede activar que se le RECUERDE el evento.
    Route::patch('/user/{event}/remind_me', [EventController::class, 'remindMe'])->name('event.remindMe');
    //  Usuario puede darse de baja de un evento.
    Route::delete('/user/{event}/', [EventController::class, 'destroySignedUp'])->name('event.destroySignedUp');


    Route::middleware('artist')->group(function () {
        //Actualiza los detalles específicos del artista (bio, redes sociales, donation_url) en la tabla 'artist_profiles'.
        Route::patch('/artist-profile', [ArtistProfileController::class, 'update'])->name('artist-profile.update');
        //Recupera y muestra la lista de seguidores del artista actual.
        Route::get('/my-followers', [FollowerController::class, 'followers'])->name('followers.followers');
        //Muestra estadísticas del perfil de artista y sus eventos.
        Route::get('/artist/statistics', [ArtistProfileController::class, 'statistics'])->name('artist.statistics');

        //------------------------------EVENTOS--------------------------------
        //  Artista puede ver sus eventos.
        Route::get('/event', [EventController::class, 'index'])->name('event.index');
        //  Artista crea un evento.
        Route::post('/event/create', [EventController::class, 'create'])->name('event.create');
        //  Artista edita un evento.
        Route::put('/event/{event}',[EventController::class, 'update'])->name('event.update');
        //  Artista elimina un evento.
        Route::delete('/event/{event}',[EventController::class, 'destroy'])->name('event.destroy');
        //  Artista asigna/edita categorías de un evento.
        Route::put('/event/{event}/categories', [EventController::class, 'categories'])->name('event.categories');
        //  Artista cambia el estado de un evento.
        Route::patch('/event/{id}/status', [EventController::class, 'status'])->name('event.status');
    });
    //Panel de administración.
    // Control de usuarios, estadísticas y moderación de la plataforma.
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminUserController::class, 'index']);
        Route::get('/admin/users/{id}', [AdminUserController::class, 'show']);
        Route::patch('/admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    });
});
// Al hacer Route::resource podemos usar all los métodos CRUD gracias a artisan.
//Route::resource('/friend', FriendController::class);

require __DIR__.'/auth.php';
