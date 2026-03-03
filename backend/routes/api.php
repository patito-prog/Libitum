<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\FollowerController;

// --- RUTA PÚBLICA (No necesita token, porque venimos a pedirlo) ---
Route::post('/login', [AuthController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);
// --- RUTAS PROTEGIDAS (Necesitan el token de Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // 1. La ruta por defecto de Laravel (¡Perfecta para que el profe pruebe el token!)
    Route::get('/user', function (Request $request) {
        return response()->json([
            'error' => false,
            'message' => 'Token válido',
            'data' => $request->user()
        ], 200);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // 2. Tus rutas de seguidores para la API
    Route::get('/my-favorites', [FollowerController::class, 'index']);
    Route::post('/artist/{id}/follow', [FollowerController::class, 'store']);
    Route::delete('/artist/{id}/unfollow', [FollowerController::class, 'destroy']);
    
});