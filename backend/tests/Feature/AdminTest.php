<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests del panel de administración.
 *
 * Lo más crítico en seguridad: que los endpoints de admin
 * estén bloqueados para cualquier usuario que no sea admin.
 */
class AdminTest extends TestCase
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

    private function makeAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function makeSpectator(): User
    {
        $user = User::factory()->create();
        $user->assignRole('spectator');
        return $user;
    }

    private function makeArtist(): User
    {
        $user = User::factory()->create();
        $user->assignRole('artist');
        ArtistProfile::create(['user_id' => $user->id]);
        return $user;
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    /**
     * Un admin puede listar todos los usuarios.
     * La respuesta incluye los campos de paginación de Laravel.
     */
    public function test_admin_can_list_users(): void
    {
        $admin = $this->makeAdmin();
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/users');

        $response->assertOk();

        // La respuesta paginada de Laravel siempre tiene 'current_page' y 'data'.
        $response->assertJsonStructure([
            'data' => ['data', 'current_page', 'last_page', 'total'],
        ]);
    }

    /**
     * Un espectador (o cualquier no-admin) recibe 403 al intentar acceder
     * al panel de admin. Este es el test de seguridad más importante.
     */
    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $spectator = $this->makeSpectator();

        $this->actingAs($spectator, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertForbidden();

        $this->actingAs($spectator, 'sanctum')
            ->getJson('/api/admin/events')
            ->assertForbidden();
    }

    /**
     * Un admin puede cambiar el rol de un usuario.
     * Si el nuevo rol es 'artist', se crea automáticamente su ArtistProfile.
     */
    public function test_admin_can_change_user_role(): void
    {
        $admin     = $this->makeAdmin();
        $spectator = $this->makeSpectator();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/users/{$spectator->id}", [
                'role' => 'artist',
            ]);

        $response->assertOk();

        // El usuario ahora debe tener el rol 'artist'.
        $this->assertTrue($spectator->fresh()->hasRole('artist'));

        // Y se le debe haber creado el ArtistProfile automáticamente.
        $this->assertDatabaseHas('artist_profiles', ['user_id' => $spectator->id]);
    }

    /**
     * Un admin puede eliminar cualquier evento de la plataforma.
     */
    public function test_admin_can_delete_any_event(): void
    {
        $admin       = $this->makeAdmin();
        $artist      = $this->makeArtist();
        $publishedId = Status::where('name', 'published')->first()->id;

        $event = Event::factory()->create([
            'user_id'   => $artist->id,
            'status_id' => $publishedId,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/events/{$event->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }
}
