<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProfileController extends Controller
{
    public function show(Request $request, $id)
    {
        $currentUserId = Auth::id();

        $user = User::findOrFail($id);
        $role = $user->getRoleNames()->first() ?? 'spectator';

        $base = [
            'id'         => $user->id,
            'name'       => $user->name,
            'avatar_url' => $user->avatar_url,
            'city'       => $user->city,
            'role'       => $role,
        ];

        if ($role === 'artist') {
            $user->load([
                'artistProfile',
                'createdEvents' => fn($q) => $q->with('status', 'categories')->latest()->limit(12),
            ]);

            $data = array_merge($base, [
                'artist_profile'  => $user->artistProfile,
                'events'          => $user->createdEvents,
                'events_count'    => $user->createdEvents->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'is_following'    => $currentUserId
                    ? $user->followers()->where('user_id', $currentUserId)->exists()
                    : false,
            ]);
        } else {
            $following = $user->following()->with('artistProfile')->get();

            $data = array_merge($base, [
                'following'       => $following,
                'following_count' => $following->count(),
                'liked_count'     => $user->likes()->count(),
            ]);
        }

        return response()->json([
            'error'   => false,
            'message' => 'Perfil de usuario recuperado',
            'data'    => $data,
        ]);
    }
}
