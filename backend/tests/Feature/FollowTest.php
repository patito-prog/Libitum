<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests del sistema de seguimiento de artistas.
 */
class FollowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $this->artisan('db:seed --class=PermissionSeeder');
        $this->artisan('db:seed --class=RoleSeeder');
        $this->artisan('db:seed --class=StatusSeeder');
    }

    private function makeArtist(): User
    {
        $user = User::factory()->create();
        $user->assignRole('artist');
        ArtistProfile::create(['user_id' => $user->id]);
        return $user;
    }

    private function makeSpectator(): User
    {
        $user = User::factory()->create();
        $user->assignRole('spectator');
        return $user;
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    /**
     * Un usuario puede seguir a un artista.
     * Verificamos que la relación queda registrada en la tabla 'follows'.
     */
    public function test_user_can_follow_an_artist(): void
    {
        $spectator = $this->makeSpectator();
        $artist    = $this->makeArtist();

        $response = $this->actingAs($spectator, 'sanctum')
            ->postJson("/api/artist/{$artist->id}/follow");

        $response->assertOk();

        $this->assertDatabaseHas('follows', [
            'user_id'   => $spectator->id,
            'artist_id' => $artist->id,
        ]);
    }

    /**
     * Un usuario puede dejar de seguir a un artista.
     * La fila debe desaparecer de 'follows' tras el unfollow.
     */
    public function test_user_can_unfollow_an_artist(): void
    {
        $spectator = $this->makeSpectator();
        $artist    = $this->makeArtist();

        // Primero seguimos al artista.
        $this->actingAs($spectator, 'sanctum')
            ->postJson("/api/artist/{$artist->id}/follow");

        // Luego dejamos de seguirle.
        $response = $this->actingAs($spectator, 'sanctum')
            ->deleteJson("/api/artist/{$artist->id}/unfollow");

        $response->assertOk();

        $this->assertDatabaseMissing('follows', [
            'user_id'   => $spectator->id,
            'artist_id' => $artist->id,
        ]);
    }
}
