<?php

namespace App\Console\Commands;

use App\Mail\EventReminder;
use App\Models\Event;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendEventReminders extends Command
{
    // Lo que escribes en terminal: php artisan reminders:send
    protected $signature   = 'reminders:send';
    protected $description = 'Envía recordatorios de email para eventos que ocurren en las próximas 24 horas';

    public function handle(): void
    {
        // Ventana de tiempo: desde ahora hasta dentro de 24 horas.
        // Así, si el scheduler lo lanza cada día a las 9:00,
        // siempre cubre exactamente los eventos del día siguiente.
        $from = now();
        $to   = now()->addDay();

        // Una sola query: eventos en esa ventana de tiempo que tengan
        // al menos un asistente con remind_me = true.
        // Con el with() cargamos ya esos asistentes filtrados para no
        // hacer más queries dentro del bucle (evitamos el problema N+1).
        $events = Event::whereBetween('event_date', [$from, $to])
            ->whereHas('attendees', fn($q) => $q->wherePivot('remind_me', true))
            ->with(['attendees' => fn($q) => $q->wherePivot('remind_me', true)])
            ->get();

        if ($events->isEmpty()) {
            $this->info('No hay eventos próximos con recordatorios activos.');
            return;
        }

        $sent = 0;

        foreach ($events as $event) {
            foreach ($event->attendees as $user) {
                // Mail::to()->send() usa el driver configurado en .env.
                // En desarrollo (MAIL_MAILER=log) escribe el email en storage/logs/laravel.log.
                // En producción apuntaría a SMTP real (SendGrid, Mailgun, etc.).
                Mail::to($user->email)->send(new EventReminder($event, $user));
                $sent++;
            }
        }

        // El método info() escribe en la consola (y en el log del scheduler).
        $this->info("Recordatorios enviados: {$sent}");
    }
}
