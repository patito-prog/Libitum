<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests sobre creación, edición y borrado de eventos.
 *
 * RefreshDatabase envuelve cada test en una transacción que se revierte al terminar,
 * dejando la BD limpia para el siguiente. Nunca se acumulan datos entre tests.
 */
class EventTest extends TestCase
{
    use RefreshDatabase;

    // setUp() se ejecuta antes de CADA test de esta clase.
    protected function setUp(): void
    {
        parent::setUp();

        // Spatie guarda permisos en caché. Al refrescar la BD hay que limpiarla
        // o los roles del test anterior se "cuelan" en el siguiente.
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Ejecutamos los seeders necesarios para que existan roles, permisos y estados.
        $this->artisan('db:seed --class=PermissionSeeder');
        $this->artisan('db:seed --class=RoleSeeder');
        $this->artisan('db:seed --class=StatusSeeder');
    }

    // ─── Helpers privados ──────────────────────────────────────────────────────
    // Estos métodos crean usuarios con su rol correcto para no repetir código.

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

    private function publishedStatusId(): int
    {
        return Status::where('name', 'published')->first()->id;
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    /**
     * Un artista autenticado puede crear un evento.
     * Verificamos que la respuesta sea OK y que el evento exista en la BD.
     */
    public function test_artist_can_create_event(): void
    {
        $artist = $this->makeArtist();

        // actingAs() autentica al usuario en la request sin pasar por tokens.
        // 'sanctum' indica el guard que usa nuestra API.
        $response = $this->actingAs($artist, 'sanctum')
            ->postJson('/api/events', [
                'title'       => 'Concierto de prueba',
                'description' => 'Descripción del evento de prueba',
                'location'    => 'Madrid, España',
                'event_date'  => now()->addMonth()->toDateTimeString(),
                'price'       => 10.00,
                'status_id'   => $this->publishedStatusId(),
            ]);

        $response->assertOk();

        // Comprobamos que el evento se ha guardado realmente en la BD.
        $this->assertDatabaseHas('events', ['title' => 'Concierto de prueba']);
    }

    /**
     * Un espectador NO puede crear eventos — el middleware 'artist' lo bloquea con 403.
     */
    public function test_spectator_cannot_create_event(): void
    {
        $spectator = $this->makeSpectator();

        $response = $this->actingAs($spectator, 'sanctum')
            ->postJson('/api/events', [
                'title'      => 'Intento no autorizado',
                'event_date' => now()->addMonth()->toDateTimeString(),
                'status_id'  => $this->publishedStatusId(),
            ]);

        // 403 Forbidden — el middleware IsArtist rechaza la petición.
        $response->assertForbidden();
        $this->assertDatabaseMissing('events', ['title' => 'Intento no autorizado']);
    }

    /**
     * Un usuario sin token no puede crear eventos — Sanctum devuelve 401.
     */
    public function test_unauthenticated_user_cannot_create_event(): void
    {
        // Sin actingAs() la request llega sin autenticación.
        $response = $this->postJson('/api/events', [
            'title'      => 'Sin autenticar',
            'event_date' => now()->addMonth()->toDateTimeString(),
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Un artista NO puede editar el evento de otro artista.
     * El UpdateEventRequest comprueba que el user_id del evento coincida con el autenticado.
     */
    public function test_artist_cannot_edit_another_artists_event(): void
    {
        $owner  = $this->makeArtist();
        $other  = $this->makeArtist();
        $event  = Event::factory()->create([
            'user_id'   => $owner->id,
            'status_id' => $this->publishedStatusId(),
        ]);

        $response = $this->actingAs($other, 'sanctum')
            ->putJson("/api/events/{$event->id}", [
                'title'       => 'Título modificado por otro',
                'description' => 'desc',
                'location'    => 'loc',
                'event_date'  => now()->addMonth()->toDateTimeString(),
                'status_id'   => $this->publishedStatusId(),
            ]);

        $response->assertForbidden();
        // El título original no debe haber cambiado.
        $this->assertDatabaseMissing('events', ['title' => 'Título modificado por otro']);
    }

    /**
     * Un artista SÍ puede borrar su propio evento.
     */
    public function test_artist_can_delete_own_event(): void
    {
        $artist = $this->makeArtist();
        $event  = Event::factory()->create([
            'user_id'   => $artist->id,
            'status_id' => $this->publishedStatusId(),
        ]);

        $response = $this->actingAs($artist, 'sanctum')
            ->deleteJson("/api/events/{$event->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }
}
