<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests del listado/búsqueda pública de artistas (GET /api/artists), que alimenta
 * la página "Descubre artistas".
 */
class ArtistListTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        $this->artisan('db:seed --class=PermissionSeeder');
        $this->artisan('db:seed --class=RoleSeeder');
    }

    private function makeArtist(string $name): User
    {
        $user = User::factory()->create(['name' => $name, 'email_verified_at' => now()]);
        $user->assignRole('artist');
        ArtistProfile::create(['user_id' => $user->id]);
        return $user;
    }

    /** El listado devuelve solo artistas (no espectadores). */
    public function test_lists_only_artists(): void
    {
        $this->makeArtist('Artista Uno');
        $this->makeArtist('Artista Dos');
        // Un espectador que NO debe aparecer.
        User::factory()->create()->assignRole('spectator');

        $response = $this->getJson('/api/artists');

        $response->assertOk();
        $this->assertCount(2, $response->json('data.data'));
    }

    /** La búsqueda por nombre es insensible a mayúsculas/minúsculas. */
    public function test_search_by_name_is_case_insensitive(): void
    {
        $this->makeArtist('Mozart Callejero');
        $this->makeArtist('Beethoven del Metro');

        $response = $this->getJson('/api/artists?q=mozart');

        $response->assertOk();
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertSame('Mozart Callejero', $data[0]['name']);
    }

    /** El campo is_following refleja si el usuario actual ya sigue al artista. */
    public function test_is_following_flag_for_authenticated_user(): void
    {
        $artist   = $this->makeArtist('Artista Seguido');
        $follower = User::factory()->create(['email_verified_at' => now()]);
        $follower->assignRole('spectator');
        $follower->following()->attach($artist->id);

        $response = $this->actingAs($follower, 'sanctum')->getJson('/api/artists');

        $response->assertOk();
        $artistData = collect($response->json('data.data'))->firstWhere('id', $artist->id);
        $this->assertTrue($artistData['is_following']);
    }
}
