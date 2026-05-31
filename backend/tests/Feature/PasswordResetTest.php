<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordLibitum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

/**
 * Tests del flujo "olvidé mi contraseña" (recuperar por correo).
 */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /** Pedir el enlace envía la notificación de restablecer contraseña. */
    public function test_forgot_password_sends_reset_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'ana@ejemplo.com']);

        $response = $this->postJson('/api/forgot-password', ['email' => 'ana@ejemplo.com']);

        $response->assertOk();
        Notification::assertSentTo($user, ResetPasswordLibitum::class);
    }

    /** Con un token válido, el usuario puede cambiar su contraseña. */
    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user  = User::factory()->create(['email' => 'ana@ejemplo.com']);
        $token = Password::createToken($user); // token real del broker

        $response = $this->postJson('/api/reset-password', [
            'token'                 => $token,
            'email'                 => 'ana@ejemplo.com',
            'password'              => 'nuevaclave123',
            'password_confirmation' => 'nuevaclave123',
        ]);

        $response->assertOk();
        // La nueva contraseña funciona.
        $this->assertTrue(Hash::check('nuevaclave123', $user->fresh()->password));
    }

    /** Un token inválido no permite cambiar la contraseña. */
    public function test_reset_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email'    => 'ana@ejemplo.com',
            'password' => Hash::make('viejaclave123'),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token'                 => 'token-falso',
            'email'                 => 'ana@ejemplo.com',
            'password'              => 'nuevaclave123',
            'password_confirmation' => 'nuevaclave123',
        ]);

        $response->assertStatus(422);
        // La contraseña NO ha cambiado.
        $this->assertTrue(Hash::check('viejaclave123', $user->fresh()->password));
    }

    /** La nueva contraseña debe tener al menos 8 caracteres. */
    public function test_reset_requires_min_8_password(): void
    {
        $user  = User::factory()->create(['email' => 'ana@ejemplo.com']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'token'                 => $token,
            'email'                 => 'ana@ejemplo.com',
            'password'              => 'corta',
            'password_confirmation' => 'corta',
        ]);

        $response->assertStatus(422);
    }
}
