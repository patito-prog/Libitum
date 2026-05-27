<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class UserProfileController extends Controller
{
    public function show(Request $request, $id)
    {
        // Route is public — manually resolve the bearer token so Auth works without middleware.
        $currentUserId = null;
        if ($bearer = $request->bearerToken()) {
            $token = PersonalAccessToken::findToken($bearer);
            if ($token && $token->tokenable) {
                $currentUserId = (int) $token->tokenable_id;
            }
        }

        $user = User::findOrFail($id);
        $role = $user->getRoleNames()->first() ?? 'spectator';

        $base = [
            'id'         => $user->id,
            'name'       => $user->name,
            'avatar_url' => $user->avatar_url,
            'city'       => $user->city,
            'role'       => $role,
            // Only expose email to the profile owner
            'email'      => ($currentUserId === (int)$id) ? $user->email : null,
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
                    ? $user->followers()->wherePivot('user_id', $currentUserId)->exists()
                    : false,
            ]);
        } else {
            $user->load(['events' => fn($q) => $q->with('status')]);

            $now = now()->timestamp;
            $sorted = $user->events->sortBy(function ($event) use ($now) {
                $ts     = $event->event_date ? $event->event_date->timestamp : PHP_INT_MAX;
                $isLive = $event->status?->name === 'live';

                if ($isLive)       return 0 * 1e13 + $ts;   // live first, asc by date
                if ($ts >= $now)   return 1 * 1e13 + $ts;   // upcoming, asc by date
                return                    2 * 1e13 + (1e12 - $ts); // past, desc (recent first)
            })->take(12)->values();

            $data = array_merge($base, [
                'events'          => $sorted,
                'events_count'    => $user->events->count(),
                'following_count' => $user->following()->count(),
            ]);
        }

        return response()->json([
            'error'   => false,
            'message' => 'Perfil de usuario recuperado',
            'data'    => $data,
        ]);
    }

    public function followers($id)
    {
        $user = User::findOrFail($id);

        $list = $user->followers()
            ->select('users.id', 'users.name', 'users.avatar_url', 'users.city')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'avatar_url' => $u->avatar_url,
                'city'       => $u->city,
                'role'       => $u->getRoleNames()->first() ?? 'spectator',
            ]);

        return response()->json(['error' => false, 'data' => $list]);
    }

    public function following($id)
    {
        $user = User::findOrFail($id);

        $list = $user->following()
            ->select('users.id', 'users.name', 'users.avatar_url', 'users.city')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'avatar_url' => $u->avatar_url,
                'city'       => $u->city,
                'role'       => $u->getRoleNames()->first() ?? 'spectator',
            ]);

        return response()->json(['error' => false, 'data' => $list]);
    }
}
