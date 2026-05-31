<?php

namespace App\Console\Commands;

use App\Mail\EventReminder;
use App\Models\Event;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Comando que envía por email los recordatorios de eventos.
 *
 * Se ejecuta con `php artisan reminders:send` y está programado a diario en
 * routes/console.php. Busca eventos de las próximas 24h que tengan asistentes
 * con el recordatorio activado y les manda el aviso.
 */
class SendEventReminders extends Command
{
    protected $signature   = 'reminders:send';
    protected $description = 'Envía recordatorios de email para eventos que ocurren en las próximas 24 horas';

    /** Lógica del comando: busca eventos próximos con recordatorio y envía los emails. */
    public function handle(): void
    {
        // Ventana de tiempo: desde ahora hasta dentro de 48 horas.
        // Como el comando se lanza una vez al día, una ventana de 48h hace que
        // cada evento entre en DOS ejecuciones seguidas: la del día anterior y
        // la del mismo día. Así el asistente recibe dos avisos (un día antes y
        // el día del evento), con tiempo de sobra para prepararse.
        $from = now();
        $to   = now()->addDays(2);

        // Una sola query: eventos en esa ventana de tiempo que tengan
        // al menos un asistente con remind_me = true.
        // Con el with() cargamos ya esos asistentes filtrados para no
        // hacer más queries dentro del bucle (evitamos el problema N+1).
        // En el whereHas referenciamos la columna de la tabla pivote directamente
        // (event_user.remind_me): dentro del whereHas, wherePivot() no genera bien
        // el SQL. En el with() sí podemos usar wherePivot porque es la relación.
        $events = Event::whereBetween('event_date', [$from, $to])
            ->whereHas('attendees', fn($q) => $q->where('event_user.remind_me', true))
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

        $this->info("Recordatorios enviados: {$sent}");
    }
}
