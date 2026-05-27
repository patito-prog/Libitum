@component('mail::message')
# ¡Tu evento es mañana, {{ $user->name }}! 🎶

No te pierdas **{{ $event->title }}**.

@component('mail::panel')
📅 **Fecha:** {{ \Carbon\Carbon::parse($event->event_date)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY [a las] HH:mm') }}
@if($event->location)
📍 **Lugar:** {{ $event->location }}
@endif
@if($event->price > 0)
💶 **Precio:** {{ number_format($event->price, 2) }} €
@else
🎟️ **Entrada gratuita**
@endif
@endcomponent

Activaste el recordatorio para este evento. ¡Esperamos que lo disfrutes!

@component('mail::button', ['url' => config('app.frontend_url', 'http://localhost:5173') . '/event/' . $event->id, 'color' => 'primary'])
Ver evento
@endcomponent

Hasta pronto,
**El equipo de Libitum**

@component('mail::subcopy')
Si no quieres recibir más recordatorios, desactívalos desde tu sección de **Mis Asistencias**.
@endcomponent
@endcomponent
