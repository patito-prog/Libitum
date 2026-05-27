<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests del feed (Para Ti / Siguiendo).
 *
 * El caso más importante: los borradores nunca deben aparecer en el feed público,
 * independientemente del modo o de quién sea el artista.
 */
class FeedTest extends TestCase
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
     * Los eventos en estado 'draft' nunca deben aparecer en el feed.
     * Este es el bug que arreglamos: un artista no debería ver sus borradores
     * en el feed público de otros usuarios.
     */
    public function test_feed_does_not_include_draft_events(): void
    {
        $artist    = $this->makeArtist();
        $spectator = $this->makeSpectator();

        $draftId     = Status::where('name', 'draft')->first()->id;
        $publishedId = Status::where('name', 'published')->first()->id;

        // Creamos un borrador y un publicado del mismo artista.
        Event::factory()->create(['user_id' => $artist->id, 'status_id' => $draftId,     'title' => 'Borrador secreto']);
        Event::factory()->create(['user_id' => $artist->id, 'status_id' => $publishedId, 'title' => 'Evento público']);

        $response = $this->actingAs($spectator, 'sanctum')
            ->getJson('/api/feed?mode=discover');

        $response->assertOk();

        // Convertimos la respuesta en array para inspeccionar los títulos.
        $titles = collect($response->json('data.data'))->pluck('title');

        $this->assertFalse($titles->contains('Borrador secreto'), 'Los borradores NO deben aparecer en el feed');
        $this->assertTrue($titles->contains('Evento público'),    'Los publicados SÍ deben aparecer');
    }

    /**
     * El modo 'following' solo muestra eventos de artistas a los que sigues.
     */
    public function test_feed_following_mode_shows_only_followed_artists(): void
    {
        $spectator       = $this->makeSpectator();
        $followedArtist  = $this->makeArtist();
        $strangerArtist  = $this->makeArtist();

        $publishedId = Status::where('name', 'published')->first()->id;

        // El espectador sigue solo a uno de los dos artistas.
        // La tabla follows tiene user_id (quien sigue) y artist_id (a quien se sigue).
        \DB::table('follows')->insert([
            'user_id'    => $spectator->id,
            'artist_id'  => $followedArtist->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Event::factory()->create(['user_id' => $followedArtist->id, 'status_id' => $publishedId, 'title' => 'Evento del seguido']);
        Event::factory()->create(['user_id' => $strangerArtist->id, 'status_id' => $publishedId, 'title' => 'Evento del desconocido']);

        $response = $this->actingAs($spectator, 'sanctum')
            ->getJson('/api/feed?mode=following');

        $response->assertOk();

        $titles = collect($response->json('data.data'))->pluck('title');

        $this->assertTrue($titles->contains('Evento del seguido'),       'Debe aparecer el evento del artista seguido');
        $this->assertFalse($titles->contains('Evento del desconocido'),  'NO debe aparecer el evento del artista no seguido');
    }

    /**
     * El feed requiere autenticación — un usuario sin token recibe 401.
     */
    public function test_feed_requires_authentication(): void
    {
        $response = $this->getJson('/api/feed');
        $response->assertUnauthorized();
    }
}
