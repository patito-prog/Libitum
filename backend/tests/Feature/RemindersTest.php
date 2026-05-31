<?php

namespace Tests\Feature;

use App\Mail\EventReminder;
use App\Models\ArtistProfile;
use App\Models\Event;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Tests del comando 'reminders:send' (el batch de recordatorios por email).
 *
 * Comprueba que solo se avisa a los asistentes que tienen el recordatorio
 * ACTIVADO (remind_me = true) — justo lo que el bug de la query rompía.
 */
class RemindersTest extends TestCase
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

    public function test_reminders_only_go_to_users_with_remind_me_enabled(): void
    {
        Mail::fake();

        // Artista dueño del evento.
        $artist = User::factory()->create(['email_verified_at' => now()]);
        $artist->assignRole('artist');
        ArtistProfile::create(['user_id' => $artist->id]);

        // Evento dentro de las próximas 24h (entra en la ventana del recordatorio).
        $event = Event::factory()->create([
            'user_id'    => $artist->id,
            'event_date' => now()->addHours(5),
            'status_id'  => Status::where('name', 'published')->first()->id,
        ]);

        // Un asistente CON recordatorio y otro SIN recordatorio.
        $wantsReminder = User::factory()->create(['email_verified_at' => now()]);
        $noReminder    = User::factory()->create(['email_verified_at' => now()]);
        $wantsReminder->events()->attach($event->id, ['remind_me' => true]);
        $noReminder->events()->attach($event->id, ['remind_me' => false]);

        $this->artisan('reminders:send')->assertSuccessful();

        // Le llega solo al que lo tenía activado.
        Mail::assertSent(EventReminder::class, fn($mail) => $mail->hasTo($wantsReminder->email));
        Mail::assertNotSent(EventReminder::class, fn($mail) => $mail->hasTo($noReminder->email));
    }

    /** Un evento dentro de ~36h (más de 24h, menos de 48h) SÍ entra en la ventana. */
    public function test_reminder_sent_for_event_within_48h(): void
    {
        Mail::fake();

        $artist = User::factory()->create(['email_verified_at' => now()]);
        $artist->assignRole('artist');
        ArtistProfile::create(['user_id' => $artist->id]);

        $event = Event::factory()->create([
            'user_id'    => $artist->id,
            'event_date' => now()->addHours(36),
            'status_id'  => Status::where('name', 'published')->first()->id,
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->events()->attach($event->id, ['remind_me' => true]);

        $this->artisan('reminders:send')->assertSuccessful();

        Mail::assertSent(EventReminder::class, fn($mail) => $mail->hasTo($user->email));
    }

    public function test_no_reminders_for_events_outside_the_window(): void
    {
        Mail::fake();

        $artist = User::factory()->create(['email_verified_at' => now()]);
        $artist->assignRole('artist');
        ArtistProfile::create(['user_id' => $artist->id]);

        // Evento dentro de una semana: fuera de la ventana de 24h.
        $event = Event::factory()->create([
            'user_id'    => $artist->id,
            'event_date' => now()->addWeek(),
            'status_id'  => Status::where('name', 'published')->first()->id,
        ]);

        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->events()->attach($event->id, ['remind_me' => true]);

        $this->artisan('reminders:send')->assertSuccessful();

        Mail::assertNothingSent();
    }
}
