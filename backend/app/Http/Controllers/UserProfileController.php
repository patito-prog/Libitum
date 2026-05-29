<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Sirve el perfil social de un usuario (/users/{id}).
 * Devuelve datos distintos según sea artista (perfil, eventos, seguidores) o
 * espectador (eventos a los que asiste).
 */
class UserProfileController extends Controller
{
    /**
     * Devuelve el perfil de un usuario por id.
     *
     * La ruta es pública, así que resolvemos el token Bearer a mano para saber
     * quién mira (y poder marcar is_following) sin depender del middleware auth.
     *
     * @param int $id Id del usuario
     */
    public function show(Request $request, $id)
    {
        // Ruta pública: resolvemos el token a mano para saber quién consulta.
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
                // Cargamos más eventos de los que mostramos para poder ordenar bien
                'createdEvents' => fn($q) => $q->with('status', 'categories')
                    ->whereHas('status', fn($s) => $s->where('name', '!=', 'draft'))
                    ->limit(50),
            ]);

            // Ordenar: live → próximos (asc por fecha) → pasados (desc, reciente primero) → cancelados
            $scale  = 1e12;
            $sorted = $user->createdEvents->sortBy(function ($event) use ($scale) {
                $effective = $event->effective_status_name;
                $ts        = $event->event_date ? $event->event_date->timestamp : PHP_INT_MAX;

                return match ($effective) {
                    'live'      => 0 * $scale + $ts,
                    'published' => 1 * $scale + $ts,
                    'finished'  => 2 * $scale + ($scale - $ts),
                    'cancelled' => 3 * $scale + $ts,
                    default     => 4 * $scale + $ts,
                };
            })->take(12)->values();

            $liveEvent = $user->createdEvents->first(fn($e) => $e->effective_status_name === 'live');

            $data = array_merge($base, [
                'artist_profile'  => $user->artistProfile,
                'events'          => $sorted,
                'events_count'    => $user->createdEvents->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'is_following'    => $currentUserId
                    ? $user->followers()->wherePivot('user_id', $currentUserId)->exists()
                    : false,
                'is_live'         => $liveEvent !== null,
                'live_event_id'   => $liveEvent?->id,
            ]);
        } else {
            $user->load(['events' => fn($q) => $q->with('status')]);

            $now = now()->timestamp;
            $sorted = $user->events->sortBy(function ($event) use ($now) {
                $ts     = $event->event_date ? $event->event_date->timestamp : PHP_INT_MAX;
                $isLive = $event->effective_status_name === 'live';

                if ($isLive)       return 0 * 1e13 + $ts;   // live first
                if ($ts >= $now)   return 1 * 1e13 + $ts;   // próximos, asc por fecha
                return                    2 * 1e13 + (1e12 - $ts); // pasados, desc
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
