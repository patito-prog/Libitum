<?php

use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


/**
 * Su ejecución será para que los que quieran solicitar estas rutas tengan que estar AUTENTICADOS y sean ARTISTAS.
 * Por ahora estamos haciendo las pruebas sin middleware.
 *
Route::middleware(['auth', 'is_artist'])->group(function () {
 *
 */
    //------------------------ PRUEBA NO MIDDLEWARE ---------------------------------
    //----------------------------------------- ROUTE ARTIST PROFILE  --------------------------------------------------
    //Rutas de perfil de artista (name sirve para ponerle un nombre a la ruta, así luego en React podemos usar ese nombre para hacer la petición, en vez de poner la URL completa).
    Route::patch('/artist-profile', [ArtistProfileController::class, 'update'])->name('artist-profile.update');

    //  Artista ver sus eventos.
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
    //------------------------ <<PRUEBA>> ---------------------------------
/**
});
*/

//RUTAS EN EVENTOS PARA LOS USUARIOS/ESPECTADORES.
//  ARTISTA/USUARIO puede ver un evento. (CONSIDERO QUE NO HACE FALTA QUE SE AUTENTIQUE PARA ESTO)
Route::get('/event/{event}', [EventController::class, 'show'])->name('event.show');
//  Usuario puede inscribirse en un evento. (La hago petición patch porque en la base de datos por defecto se pone que le recordemos el evento)
Route::put('/user/event', [EventController::class, 'inscription'])->name('event.inscription');
// Usuario puede ver a qué eventos está inscrito.
Route::get('/user/events', [EventController::class, 'signedUp'])->name('event.signedUp');
// Usuario puede activar que se le RECUERDE el evento.
Route::patch('/user/event/{event}/remind_me', [EventController::class, 'remindMe'])->name('event.remindMe');
//  Usuario puede darse de baja de un evento.
Route::delete('/user/event/{id}/', [EventController::class, 'destroySignedUp'])->name('event.destroySignedUp');


// Al hacer Route::resource podemos usar all los métodos CRUD gracias a artisan.
//Route::resource('/friend', FriendController::class);

require __DIR__.'/auth.php';
