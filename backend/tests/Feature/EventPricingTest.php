<?php

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests del precio del evento: la opción de "donación voluntaria" (entrada
 * gratis) frente al precio fijo.
 */
class EventPricingTest extends TestCase
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
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->assignRole('artist');
        ArtistProfile::create(['user_id' => $user->id]);
        return $user;
    }

    private function publishedStatusId(): int
    {
        return Status::where('name', 'published')->first()->id;
    }

    /** Si el evento es de donación voluntaria, el precio se fuerza a 0 aunque manden uno. */
    public function test_voluntary_donation_forces_price_to_zero(): void
    {
        $artist = $this->makeArtist();

        $this->actingAs($artist, 'sanctum')->postJson('/api/events', [
            'title'       => 'Concierto a la gorra',
            'description' => 'Entrada libre, colabora si quieres',
            'location'    => 'Plaza Mayor',
            'event_date'  => now()->addWeek()->toDateTimeString(),
            'price'       => 15,        // lo mandamos a propósito...
            'is_donation' => true,      // ...pero al ser donación debe ignorarse
            'status_id'   => $this->publishedStatusId(),
        ])->assertOk();

        $event = Event::where('title', 'Concierto a la gorra')->first();
        $this->assertTrue($event->is_donation);
        $this->assertEquals(0, (float) $event->price);
    }

    /** Un evento con precio fijo guarda el precio y no es de donación. */
    public function test_fixed_price_event_keeps_its_price(): void
    {
        $artist = $this->makeArtist();

        $this->actingAs($artist, 'sanctum')->postJson('/api/events', [
            'title'       => 'Concierto con entrada',
            'description' => 'Evento con precio fijo',
            'location'    => 'Sala Central',
            'event_date'  => now()->addWeek()->toDateTimeString(),
            'price'       => 12.50,
            'is_donation' => false,
            'status_id'   => $this->publishedStatusId(),
        ])->assertOk();

        $event = Event::where('title', 'Concierto con entrada')->first();
        $this->assertFalse($event->is_donation);
        $this->assertEquals(12.50, (float) $event->price);
    }
}
