<?php

namespace App\Util;

use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Mockery\Exception;
use function PHPUnit\Framework\isEmpty;

/**
 * # 🚀 ReturnHelper: Unified Response Handler
 * * Esta clase es el núcleo de comunicación entre el Servidor y el Cliente.
 * Abstrae la toma de decisiones sobre el formato de respuesta (**API JSON** o **Web Inertia/Redirect**)
 * basándose en el contexto de la petición, permitiendo controladores más limpios y legibles.
 *
 * ---
 * ### 🛠 Características Principales
 * - **Context Awareness:** Detecta automáticamente si la petición viene de una API o del navegador.
 * - **Inertia Native:** Integración fluida para renderizar vistas o volver atrás.
 * - **Flash Management:** Sincronización automática de mensajes de éxito/error con el Middleware de la sesión.
 * - **Zero Dependency:** No requiere inyectar `$request` en los métodos del controlador.
 * * ---
 * ### 📋 Cuándo usar cada método
 * 1. `ok()`: Operaciones exitosas que requieren un Toast o redirección positiva.
 * 2. `error()`: Fallos de lógica de negocio (el usuario se queda donde está y recibe un aviso).
 * 3. `abort()`: Fallos críticos de seguridad o integridad (se detiene la ejecución inmediatamente).
 *
 * ---
 * ### 💻 Ejemplo de Implementación
 * ```php
 * public function destroy(Event $event)
 * {
 * // [1] SEGURIDAD: Acceso no autorizado
 * if (Auth::user()->id !== $event->user_id) {
 * ReturnHelper::abort(403, 'No eres el propietario de este evento.');
 * }
 *
 * // [2] LÓGICA: Validación de reglas de negocio
 * if ($event->participants()->exists()) {
 * return ReturnHelper::error('No puedes eliminar un evento con participantes.');
 * }
 *
 * // [3] ÉXITO: Proceso completado
 * $event->delete();
 * return ReturnHelper::ok('Evento eliminado con éxito.');
 * }
 * ```
 * * @package App\Util
 * @author Carri1x
 * @version 1.0.1
 * @see \App\Http\Middleware\HandleInertiaRequests :: Para la sincronización de props flash.
 */

class ReturnHelper
{
    /**
     * ### ✅ ok()
     * Genera una respuesta de éxito (HTTP 200).
     * * **Parámetros:**
     * - **string** `$message`: Mensaje que verá el usuario (Toast/Alert).
     * - **array** `$data`: Modelos o colecciones adicionales.
     * - **string|null** `$component`: Nombre del componente Inertia (opcional).
     * * **Ejemplo:**
     * ```php
     * return ReturnHelper::ok('Perfil actualizado', ['user' => $user]);
     * ```
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
     * ### ❌ error()
     * Genera una respuesta de error controlada (HTTP 400+).
     * * **Parámetros:**
     * - **string** `$message`: Explicación del fallo.
     * - **int** `$status`: Código HTTP (400, 403, 404, 500).
     * - **array** `$data`: Contexto adicional del error.
     * - **string|null** `$component`: Redirigir a una vista de error específica.
     * * **Ejemplo:**
     * ```php
     * return ReturnHelper::error('No tienes fondos suficientes', 402);
     * ```
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
     * ### 🛑 abort()
     * Detiene la ejecución inmediatamente (Excepción HTTP).
     * * Úselo para brechas de seguridad o recursos inexistentes donde no se debe permitir el `back()`.
     * * En caso de ser una petición `/api` envia una Excepción HTTP con un `JsonResponse->send()`
     */
    public static function abort(int $status, string $message = '')
    {
        if (Request::is('api/*') || Request::expectsJson()) {
            response()->json([
                'error'   => true,
                'status'  => $status,
                'message' => $message ?: 'Error, Acceso denegado',
            ], $status)->send();
            exit;
        }
        abort($status, $message ?: 'Error, Acceso denegado');
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
