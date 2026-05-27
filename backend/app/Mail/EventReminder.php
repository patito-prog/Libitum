<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventReminder extends Mailable
{
    use Queueable, SerializesModels;

    // Al inyectar $event y $user como públicos, la vista Blade
    // puede usarlos directamente con {{ $event->title }}, etc.
    public function __construct(
        public Event $event,
        public User  $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Recordatorio: \"{$this->event->title}\" es mañana 🎶",
        );
    }

    public function content(): Content
    {
        // 'markdown' indica que usamos la plantilla resources/views/emails/event-reminder.blade.php
        // con el sistema de componentes de email de Laravel (genera HTML bonito automáticamente).
        return new Content(
            markdown: 'emails.event-reminder',
        );
    }
}
