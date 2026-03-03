<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ArtistProfileController; 
use App\Http\Controllers\FollowerController;      
use App\Http\Controllers\AdminController;         
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

    //Rutas de perfil de artista (name sirve para ponerle un nombre a la ruta, así luego en React podemos usar ese nombre para hacer la petición, en vez de poner la URL completa).
    //Actualiza los detalles específicos del artista (bio, redes sociales, donation_url) en la tabla 'artist_profiles'.
    Route::patch('/artist-profile', [ArtistProfileController::class, 'update'])->middleware('artist')->name('artist-profile.update');

    //Rutas favoritos / seguidores.
    //Recupera y muestra la lista de artistas a los que sigue el usuario actual.
    Route::get('/my-favorites', [FollowerController::class, 'index'])->name('followers.index');
    // Crea una nueva relación de seguimiento entre el usuario y un artista.
    Route::post('/artist/{id}/follow', [FollowerController::class, 'store'])->name('followers.store');
    //Dejar de seguir al artista.
    Route::delete('/artist/{id}/unfollow', [FollowerController::class, 'destroy'])->name('followers.destroy');
});

//Panel de administración.
// Control de usuarios, estadísticas y moderación de la plataforma.
Route::middleware(['auth', 'admin'])->group(function () {
    //Renderiza el panel de control principal de administración con estadísticas globales.
    Route::get('/admin/dashboard', [AdminUserController::class, 'index'])->name('admin.dashboard');
    // Recupera una lista paginada de todos los usuarios registrados.
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    // Suspende (banea) la cuenta de un usuario específico, impidiendo futuros inicios de sesión.
    Route::patch('/admin/users/{id}/ban', [AdminUserController::class, 'ban'])->name('admin.users.ban');
});

require __DIR__.'/auth.php';
