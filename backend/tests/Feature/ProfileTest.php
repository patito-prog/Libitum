<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Tests del perfil: cambio de contraseña (mínimo 8) y validación del número de
 * Bizum del artista.
 */
class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $this->artisan('db:seed --class=PermissionSeeder');
        $this->artisan('db:seed --class=RoleSeeder');
    }

    private function makeArtist(): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->assignRole('artist');
        ArtistProfile::create(['user_id' => $user->id]);
        return $user;
    }

    /** La nueva contraseña debe tener al menos 8 caracteres. */
    public function test_password_change_rejects_short_password(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'password'          => Hash::make('password'),
        ]);

        $this->actingAs($user, 'sanctum')->patchJson('/api/profile/password', [
            'current_password'      => 'password',
            'password'              => 'corta1',     // 6 caracteres → debe fallar
            'password_confirmation' => 'corta1',
        ])->assertStatus(422);
    }

    /** Con datos correctos, la contraseña se cambia de verdad. */
    public function test_password_change_works_with_valid_data(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'password'          => Hash::make('password'),
        ]);

        $this->actingAs($user, 'sanctum')->patchJson('/api/profile/password', [
            'current_password'      => 'password',
            'password'              => 'claveNueva123',
            'password_confirmation' => 'claveNueva123',
        ])->assertOk();

        $this->assertTrue(Hash::check('claveNueva123', $user->fresh()->password));
    }

    /** Un número de Bizum no válido (no es móvil español) se rechaza. */
    public function test_invalid_bizum_is_rejected(): void
    {
        $artist = $this->makeArtist();

        $this->actingAs($artist, 'sanctum')->patchJson('/api/artist-profile', [
            'bizum_phone' => '123',
        ])->assertStatus(422);
    }

    /** Un número de Bizum válido se guarda correctamente. */
    public function test_valid_bizum_is_saved(): void
    {
        $artist = $this->makeArtist();

        $this->actingAs($artist, 'sanctum')->patchJson('/api/artist-profile', [
            'bizum_phone' => '600112233',
        ])->assertOk();

        $this->assertDatabaseHas('artist_profiles', [
            'user_id'     => $artist->id,
            'bizum_phone' => '600112233',
        ]);
    }
}
