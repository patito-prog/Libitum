<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle(Event $event)
    {
        // El método toggle da like si no hay, o quita el like si ya existe
        $event->likedBy()->toggle(Auth::id());
        
        return response()->json([
            'error' => false, 
            'liked' => $event->likedBy()->where('user_id', Auth::id())->exists()
        ]);
    }
}
