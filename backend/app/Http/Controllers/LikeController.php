<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

/**
 * Gestiona los "me gusta" de los eventos.
 */
class LikeController extends Controller
{
    /**
     * Alterna el like del usuario actual sobre un evento.
     * toggle() de Eloquent lo pone si no estaba y lo quita si ya estaba.
     * Devuelve el estado final del like.
     *
     * @param Event $event Evento (route-model binding)
     */
    public function toggle(Event $event)
    {
        $event->likedBy()->toggle(Auth::id());

        return response()->json([
            'error' => false,
            'liked' => $event->likedBy()->where('user_id', Auth::id())->exists()
        ]);
    }
}
