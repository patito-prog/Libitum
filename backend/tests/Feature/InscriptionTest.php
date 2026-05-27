<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests de inscripción y desinscripción de eventos.
 *
 * Cubrimos los tres casos que realmente importan:
 *  1. Inscribirse con éxito.
 *  2. Intentar inscribirse dos veces (409).
 *  3. Intentar inscribirse cuando el aforo está completo (409) — bug que acabamos de arreglar.
 */
class InscriptionTest extends TestCase
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
     * Un usuario autenticado puede inscribirse en un evento publicado.
     * Comprobamos que la fila aparece en la tabla pivote event_user.
     */
    public function test_user_can_inscribe_to_published_event(): void
    {
        $spectator   = $this->makeSpectator();
        $artist      = $this->makeArtist();
        $publishedId = Status::where('name', 'published')->first()->id;

        $event = Event::factory()->create([
            'user_id'   => $artist->id,
            'status_id' => $publishedId,
        ]);

        $response = $this->actingAs($spectator, 'sanctum')
            ->postJson('/api/user/event', ['event_id' => $event->id]);

        $response->assertOk();

        // assertDatabaseHas verifica que exista una fila con esos valores en la tabla.
        $this->assertDatabaseHas('event_user', [
            'user_id'  => $spectator->id,
            'event_id' => $event->id,
        ]);
    }

    /**
     * Un usuario no puede inscribirse dos veces al mismo evento.
     * El backend detecta que ya existe la relación y devuelve 409 Conflict.
     */
    public function test_user_cannot_inscribe_to_same_event_twice(): void
    {
        $spectator   = $this->makeSpectator();
        $artist      = $this->makeArtist();
        $publishedId = Status::where('name', 'published')->first()->id;

        $event = Event::factory()->create([
            'user_id'   => $artist->id,
            'status_id' => $publishedId,
        ]);

        // Primera inscripción — debe ir bien.
        $this->actingAs($spectator, 'sanctum')
            ->postJson('/api/user/event', ['event_id' => $event->id])
            ->assertOk();

        // Segunda inscripción — debe fallar con conflicto.
        $response = $this->actingAs($spectator, 'sanctum')
            ->postJson('/api/user/event', ['event_id' => $event->id]);

        $response->assertStatus(409);
    }

    /**
     * Cuando un evento tiene aforo completo, nadie más puede inscribirse.
     * Este es el bug de validación de capacidad que acabamos de arreglar en EventController.
     */
    public function test_user_cannot_inscribe_when_event_is_full(): void
    {
        $artist      = $this->makeArtist();
        $publishedId = Status::where('name', 'published')->first()->id;

        // Creamos un evento con aforo máximo de 1 persona.
        $event = Event::factory()->create([
            'user_id'      => $artist->id,
            'status_id'    => $publishedId,
            'max_capacity' => 1,
        ]);

        // El primer espectador ocupa el único hueco disponible.
        $first = $this->makeSpectator();
        $this->actingAs($first, 'sanctum')
            ->postJson('/api/user/event', ['event_id' => $event->id])
            ->assertOk();

        // El segundo espectador ya no puede entrar — aforo completo.
        $second   = $this->makeSpectator();
        $response = $this->actingAs($second, 'sanctum')
            ->postJson('/api/user/event', ['event_id' => $event->id]);

        $response->assertStatus(409);
        $response->assertJsonPath('message', 'Este evento ha alcanzado su aforo máximo.');
    }
}
