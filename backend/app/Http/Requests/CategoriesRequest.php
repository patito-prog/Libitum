<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class CategoriesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // 1. Obtenemos el evento de la ruta.
        $event = $this->route('event');
        $user = Auth::user();

        // 2. Aplicamos la lógica de seguridad de Libitum
        // El admin puede todo, si no, debe ser el dueño del evento.
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->id === $event->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id'
        ];
    }

    /**
     * Si la autorización falla, Laravel lanza una ForbiddenException.
     * Al ser una API, devolverá un JSON 403 automáticamente.
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(response()->json([
            'error' => true,
            'code' => 403,
            'message' => 'No tienes permiso para gestionar las categorías de un evento que no es tuyo.'
        ], 403));
    }
}
