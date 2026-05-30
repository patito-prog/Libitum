@extends('emails.layout')

@section('content')
    <span style="display:inline-block; background-color:#ff8a5b; color:#16181a; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:6px 12px; border-radius:999px;">
        {{ ucfirst($cuando) }} · Recordatorio
    </span>

    <h1 class="display" style="margin:16px 0 8px; font-family:'Syne','Helvetica Neue',Arial,sans-serif; font-size:36px; line-height:1.05; font-weight:800; letter-spacing:-0.03em; color:#16181a;">
        ¡Tu evento es<br>{{ $cuando }}! 🎶
    </h1>

    <p style="margin:14px 0 0; font-size:16px; line-height:1.6; color:#3a3d42;">
        @if(!empty($user?->name)){{ $user->name }}, no @else No @endif te pierdas
        <strong style="color:#1a7d82;">{{ $event->title }}</strong>.
    </p>

    {{-- Panel con los datos del evento --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0; background-color:#f4efe3; border-radius:14px;">
        <tr>
            <td style="padding: 22px 26px; font-size:15px; line-height:1.9; color:#16181a;">
                <strong>📅 Fecha:</strong>
                {{ \Carbon\Carbon::parse($event->event_date)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY [a las] HH:mm') }}
                @if($event->location)
                    <br><strong>📍 Lugar:</strong> {{ $event->location }}
                @endif
                <br>
                @if($event->price > 0)
                    <strong>💶 Precio:</strong> {{ number_format($event->price, 2) }} €
                @else
                    <strong>🎟️ Entrada gratuita</strong>
                @endif
            </td>
        </tr>
    </table>

    {{-- Botón ver evento --}}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 4px 0 8px;">
        <tr>
            <td style="background-color:#1a7d82; border-radius:12px;">
                <a href="{{ rtrim(config('app.frontend_url'), '/') . '/event/' . $event->id }}" style="display:inline-block; padding: 15px 32px; font-family:'Syne','Helvetica Neue',Arial,sans-serif; font-size:16px; font-weight:700; color:#ffffff;">
                    Ver evento →
                </a>
            </td>
        </tr>
    </table>

    <hr style="border:none; border-top:1px solid rgba(22,24,26,0.08); margin:26px 0;">

    <p style="margin:0; font-size:13px; line-height:1.6; color:#9a9da4;">
        Recibes esto porque activaste el recordatorio. Puedes desactivarlo desde
        <strong>Mis Asistencias</strong> en la web.
    </p>
@endsection
