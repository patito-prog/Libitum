<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'El servidor está funcionando, por favor haz peticiónes de API REST.';
});

// Al hacer Route::resource podemos usar all los métodos CRUD gracias a artisan.
//Route::resource('/friend', FriendController::class);

require __DIR__.'/auth.php';
