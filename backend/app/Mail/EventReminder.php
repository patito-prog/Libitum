<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class EventReminder extends Mailable
{
    use Queueable, SerializesModels;

    // Al inyectar $event y $user como públicos, la vista Blade
    // puede usarlos directamente con {{ $event->title }}, etc.
    public function __construct(
        public Event $event,
        public User  $user,
    ) {}

    /**
     * Texto de cuándo es el evento. Como el batch avisa de los eventos de las
     * PRÓXIMAS 24 HORAS, según la hora a la que se lance puede ser "hoy" o
     * "mañana"; lo calculamos de verdad en vez de poner "mañana" siempre.
     */
    private function cuando(): string
    {
        $date = Carbon::parse($this->event->event_date);
        if ($date->isToday())    return 'hoy';
        if ($date->isTomorrow()) return 'mañana';
        return $date->locale('es')->isoFormat('dddd D [de] MMMM');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Recordatorio: \"{$this->event->title}\" es {$this->cuando()} 🎶",
        );
    }

    public function content(): Content
    {
        // Plantilla HTML propia (emails.event-reminder) con la marca Libitum.
        return new Content(
            view: 'emails.event-reminder',
            with: ['cuando' => $this->cuando()],
        );
    }
}
