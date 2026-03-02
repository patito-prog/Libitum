<?php

use App\Http\Controllers\ArtistProfileController;
use App\Http\Controllers\EventController;
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


    Route::get('/event', [EventController::class, 'index'])->name('event.index');
    Route::post('/event/create', [EventController::class, 'create'])->name('event.create');
    Route::put('/event/{id}',[EventController::class, 'update'])->name('event.update');
    //------------------------ <<PRUEBA>> ---------------------------------

/**
});
*/



require __DIR__.'/auth.php';
