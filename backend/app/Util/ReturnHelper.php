<?php

namespace App\Util;

use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Mockery\Exception;
use function PHPUnit\Framework\isEmpty;

/**
 * Class ReturnHelper
 * * Esta clase actúa como un Unified Response Handler (Manejador Único de Respuestas).
 * * Su propósito es abstraer la lógica de decisión entre respuestas API (JSON) y
 * respuestas Web (Inertia/Redirect), permitiendo que los controladores permanezcan
 * limpios y no dependan de la inyección manual del objeto Request para decidir el formato.
 * * Características principales:
 * - Detección automática de contexto (API vs Web).
 * - Integración nativa con Inertia.js para renderizado de componentes.
 * - Gestión automática de mensajes Flash (success/error) para el frontend.
 * - Soporte para códigos de estado HTTP personalizados y envío de datos adicionales.
 * * @package App\Util
 * @author Carri1x
 * @version 1.0.0
 */
class ReturnHelper
{
    /**
     * Genera una respuesta de éxito (HTTP 200 por defecto).
     * * Utilice este método cuando la operación se haya completado correctamente.
     * Si se proporciona un componente, renderizará esa vista en Inertia;
     * de lo contrario, realizará una redirección hacia atrás `back()` con un mensaje flash de éxito o error.
     *
     * @param string      $message   Mensaje descriptivo del éxito de la operación.
     * @param array       $data      Datos adicionales que se enviarán (modelos, colecciones, etc.).
     * @param string|null $component Nombre del componente Inertia (ej: 'User/Profile').
     * * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse|\Inertia\Response
     * * @example ReturnHelper::ok('Perfil actualizado', ['user' => $user]);
     */
    public static function ok(string $message, array $data = [], ?string $component = null)
    {
        return self::return(
            array_merge(
                $data,
                [
                    'message' => $message,
                    'status' => $data['status'] ?? 200,
                    'component' => $component
                ]
            )
        );
    }

    /**
     * Genera una respuesta de error (HTTP 400 por defecto).
     * * Utilice este método cuando ocurra un error de lógica, permisos o falta de recursos.
     * Envía automáticamente la bandera 'error' como true para que el frontend pueda
     * identificar el tipo de respuesta y mostrar la notificación adecuada.
     *
     * @param string      $message   Mensaje explicando el error ocurrido.
     * @param int         $status    Código de estado HTTP (400, 403, 404, 500, etc.).
     * @param array       $data      Información adicional sobre el error o contexto.
     * @param string|null $component Si se desea redirigir a una página de error específica en Inertia.
     * * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse|\Inertia\Response
     * * @example ReturnHelper::error('No tienes permisos para borrar este evento', 403);
     */
    public static function error(string $message, int $status = 400, array $data = [], ?string $component = null)
    {
        return self::return(
            array_merge(
                $data,
                [
                    'error' => true,
                    'message' => $message,
                    'status' => $status,
                    'component' => $component
                ]
            )
        );
    }

    /**
     * Gestiona de forma centralizada las respuestas de la aplicación (API, Inertia o Redirección).
     * * Esta función detecta automáticamente el contexto de la petición y decide si devolver
     * un JSON, renderizar un componente de Inertia o realizar una redirección hacia atrás.
     *
     * @param array $data {
     *
     * Configuración de la respuesta.
     * @type bool   $error     Indica si la respuesta es un error (determina la clave del flash y el mensaje por defecto).
     * @type string $message   Mensaje informativo para el usuario (opcional).
     * @type int    $status    Código de estado HTTP (por defecto 200).
     * @type string $component Nombre del componente de Inertia (ej: 'Events/Show'). Si se omite, hace un back().
     * @type mixed  ...$extras Cualquier otro dato adicional se mezclará en la respuesta JSON o en las Props de Inertia.
     *
     * }
     *
     * * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse|\Inertia\Response
     * * @example
     * // Ejemplo Éxito con Redirección:
     * ReturnHelper::return(['message' => 'Guardado!', 'error' => false]);
     * * // Ejemplo Error con Componente:
     * ReturnHelper::return([
     * 'error' => true,
     * 'message' => 'Fallo crítico',
     * 'component' => 'Dashboard/Index',
     * 'status' => 500
     * ]);
     */
    public static function return(array $data = [])
    {
        $hasError = $data['error'] ?? false;
        $flashKey = $hasError ? 'error' : 'success';
        $message = $data['message'] ?? ($hasError ? 'An error has occurred' : 'Request completed successfully');
        $status = $data['status'] ?? 200;
        $component = $data['component'] ?? null;
        //  Quitamos 'component' para que no viaje innecesariamente en el JSON o en las Props
        unset($data['component']);

        if(Request::is('api/*') || Request::expectsJson()) {
            return response()->json(array_merge($data,[
                'error' => $data['error'] ?? false,
                'message' => $message,
                'status' => $status
            ]), $status);
        }

        // Si el valor de data['error'] es true, saldrá `error`, en caso de que sea false/null saldrá 'success'.


        if ($component) {
            // Renderiza una vista específica (como 'Events/Show')
            return Inertia::render($component, $data)->with($flashKey, $message);
        }

        // 3. Comportamiento por defecto: Volver atrás con mensaje.
        return back()->with($flashKey, $message)->withInput();
    }

    /*
     *  En `HandleInertiaRequest.php` tenemos esta respuesta.
     * 'flash' => [
     *          'success' => fn () => $request->session()->get('success'),
     *          'error'   => fn () => $request->session()->get('error'),
     *  ],
     *
     * En caso de que haya habido un error o haya ido todo con éxito haremos esto en la clase padre de React como el componente <Mensaje />
     * import { usePage } from '@inertiajs/react';
     * import { useEffect } from 'react';
     * import { toast } from 'react-hot-toast'; // O cualquier librería de alerts
     *
     * export default function Layout({ children }) {
     * const { flash } = usePage().props;
     *
     * useEffect(() => {
     *   if (flash.success) {
     *       // Aquí es donde decides CÓMO se ve (Alert, Toast, Modal...)
     *       toast.success(flash.success);
     *   }
     *   if (flash.error) {
     *       toast.error(flash.error);
     *   }
     *  }, [flash]);
     *
     *   return <main>{children}</main>;
     * }
    */
}
