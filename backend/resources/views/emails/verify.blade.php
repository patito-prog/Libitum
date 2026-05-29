@extends('emails.layout')

@section('content')
    <h1 class="display" style="margin:0 0 8px; font-family:'Syne','Helvetica Neue',Arial,sans-serif; font-size:38px; line-height:1.05; font-weight:800; letter-spacing:-0.03em; color:#16181a;">
        Confirma tu<br>correo 🎟️
    </h1>

    <p style="margin:18px 0 0; font-size:16px; line-height:1.6; color:#3a3d42;">
        @if(!empty($user?->name))¡Hola, {{ $user->name }}! @endif Ya casi estás dentro de <strong style="color:#1a7d82;">Libitum</strong>.
        Solo nos queda comprobar que este correo es tuyo. Pulsa el botón y listo:
    </p>

    {{-- Botón principal --}}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
        <tr>
            <td style="background-color:#1a7d82; border-radius:12px;">
                <a href="{{ $url }}" style="display:inline-block; padding: 16px 34px; font-family:'Syne','Helvetica Neue',Arial,sans-serif; font-size:16px; font-weight:700; color:#ffffff; letter-spacing:0.01em;">
                    Confirmar mi correo →
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0; font-size:14px; line-height:1.6; color:#7a7d84;">
        El enlace caduca en 60 minutos. Si no fuiste tú quien se registró, puedes ignorar este mensaje sin problema.
    </p>

    <hr style="border:none; border-top:1px solid rgba(22,24,26,0.08); margin:28px 0;">

    <p style="margin:0; font-size:13px; line-height:1.6; color:#9a9da4;">
        ¿El botón no funciona? Copia y pega esta dirección en tu navegador:<br>
        <span style="color:#1a7d82; word-break:break-all;">{{ $url }}</span>
    </p>
@endsection
