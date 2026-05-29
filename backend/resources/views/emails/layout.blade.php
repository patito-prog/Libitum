<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Libitum</title>
    <style>
        /* Algunos clientes respetan <style>; aun así llevamos estilos inline en
           lo importante para los que no (Gmail, Outlook...). */
        body { margin: 0; padding: 0; background-color: #f4efe3; }
        a { text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .px { padding-left: 24px !important; padding-right: 24px !important; }
            .display { font-size: 30px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f4efe3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#16181a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4efe3;">
        <tr>
            <td align="center" style="padding: 32px 16px;">
                <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px;">

                    {{-- Cabecera: banda teal con el wordmark --}}
                    <tr>
                        <td style="background-color:#1a7d82; border-radius:18px 18px 0 0; padding: 28px 40px;">
                            <span style="font-family:'Syne','Helvetica Neue',Arial,sans-serif; font-size:26px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; text-transform:uppercase;">
                                Libitum
                            </span>
                            <span style="display:inline-block; width:10px; height:10px; background-color:#ff8a5b; border-radius:50%; margin-left:4px; vertical-align:middle;"></span>
                        </td>
                    </tr>

                    {{-- Cuerpo: tarjeta blanca --}}
                    <tr>
                        <td class="px" style="background-color:#ffffff; padding: 44px 40px; border-left:1px solid rgba(22,24,26,0.08); border-right:1px solid rgba(22,24,26,0.08);">
                            @yield('content')
                        </td>
                    </tr>

                    {{-- Pie --}}
                    <tr>
                        <td class="px" style="background-color:#16181a; border-radius:0 0 18px 18px; padding: 26px 40px; text-align:center;">
                            <p style="margin:0; font-size:13px; color:#b8b3a7; line-height:1.6;">
                                Libitum · La cultura de calle, en tu bolsillo<br>
                                Este correo se ha enviado automáticamente, no respondas a él.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
