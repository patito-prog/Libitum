<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailLibitum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Tests del registro y login con verificación de correo obligatoria.
 *
 * Cubren el flujo que montamos: al registrarse NO se da token (hay que confirmar
 * el correo antes), el login bloquea a los no verificados, y el enlace del email
 * marca la cuenta como verificada.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        // El registro asigna rol, así que necesitamos permisos y roles sembrados.
        $this->artisan('db:seed --class=PermissionSeeder');
        $this->artisan('db:seed --class=RoleSeeder');
    }

    /**
     * Al registrarse se crea el usuario SIN verificar, NO se devuelve token y se
     * le envía la notificación de verificación.
     */
    public function test_register_creates_unverified_user_and_sends_verification(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/register', [
            'name'     => 'Nuevo Usuario',
            'email'    => 'nuevo@ejemplo.com',
            'password' => 'password123',
            'role'     => 'spectator',
        ]);

        $response->assertStatus(201)
            ->assertJson(['needs_verification' => true]);

        // No se entrega token al registrarse: primero hay que verificar.
        $this->assertArrayNotHasKey('token', $response->json());

        $this->assertDatabaseHas('users', [
            'email'             => 'nuevo@ejemplo.com',
            'email_verified_at' => null,
        ]);

        $user = User::where('email', 'nuevo@ejemplo.com')->first();
        Notification::assertSentTo($user, VerifyEmailLibitum::class);
    }

    /** Un usuario con el correo sin verificar NO puede iniciar sesión (403). */
    public function test_unverified_user_cannot_login(): void
    {
        User::factory()->unverified()->create([
            'email'    => 'sinverificar@ejemplo.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'sinverificar@ejemplo.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['needs_verification' => true]);
        $this->assertArrayNotHasKey('token', $response->json());
    }

    /** Un usuario verificado SÍ puede iniciar sesión y recibe un token. */
    public function test_verified_user_can_login(): void
    {
        User::factory()->create([
            'email'             => 'verificado@ejemplo.com',
            'password'          => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'verificado@ejemplo.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'type_token']);
    }

    /** El enlace firmado del correo marca la cuenta como verificada y redirige. */
    public function test_verification_link_verifies_the_account(): void
    {
        $user = User::factory()->unverified()->create();
        $this->assertNull($user->email_verified_at);

        $url = URL::temporarySignedRoute('api.verification.verify', Carbon::now()->addMinutes(60), [
            'id'   => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $response = $this->get($url);

        $response->assertRedirect(); // redirige al frontend (/email-verificado)
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    /** El reenvío de verificación vuelve a mandar la notificación. */
    public function test_resend_verification_sends_notification(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/email/resend', ['email' => $user->email]);

        $response->assertOk();
        Notification::assertSentTo($user, VerifyEmailLibitum::class);
    }
}
