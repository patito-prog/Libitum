<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'data' => [
                    'user' => $request->user(),
                    'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                ],
                'code' => 200
            ], 200);
        }
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => false,
                'message' => 'Información de perfil actualizada',
                'data' => $request->user(),
                'code' => 200
            ], 200);
        }
        return Redirect::route('profile.edit');
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        // Use the request's actual host+port so the URL works regardless of APP_URL config
        $url  = $request->getSchemeAndHttpHost() . '/storage/' . $path;

        $user->avatar_url = $url;
        $user->save();

        return response()->json([
            'error' => false,
            'data'  => ['avatar_url' => $url],
            'code'  => 200,
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => ['required', 'current_password'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required'],
        ], [
            'current_password.current_password' => 'La contraseña actual no es correcta.',
            'password.min'                      => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'                => 'Las contraseñas no coinciden.',
        ]);

        $request->user()->update(['password' => $request->password]);

        return response()->json([
            'error'   => false,
            'message' => 'Contraseña actualizada correctamente',
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        if ($request->is('api/*') || $request->expectsJson()) {
            $user->tokens()->delete(); 
            $user->delete();
            return response()->json([
                'error' => false,
                'message' => 'Cuenta eliminada permanentemente',
                'code' => 200
            ], 200);
        }
        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
