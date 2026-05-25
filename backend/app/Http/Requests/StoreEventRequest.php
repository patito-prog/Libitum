<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class StoreEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('admin');
        $hasPermission = $user->can('crear evento');

        return $hasPermission || $isAdmin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'event_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
            // De momento validamos que status sea uno de estos, ajústalo a tu lógica
            'status' => 'nullable|in:draft,published,cancelled',
            // Validamos que 'categories' sea un array y que los IDs existan en la tabla
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ];
    }

    /**
     * Obtiene los mensajes de error personalizados para las reglas de validación definidas.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Título
            'title.required' => 'El título del evento es obligatorio.',
            'title.string'   => 'El título debe ser un texto válido.',
            'title.max'      => 'El título no puede tener más de 255 caracteres.',

            // Descripción
            'description.required' => 'Debes añadir una descripción para el evento.',
            'description.string'   => 'La descripción debe ser un texto válido.',

            // Ubicación
            'location.required' => 'La ubicación es necesaria para que los asistentes sepan a dónde ir.',
            'location.max'      => 'La ubicación es demasiado larga (máximo 255 caracteres).',

            // Fecha
            'event_date.required' => 'La fecha del evento es obligatoria.',
            'event_date.date'     => 'La fecha introducida no tiene un formato válido.',

            // Precio
            'price.numeric' => 'El precio debe ser un número.',
            'price.min'     => 'El precio no puede ser negativo.',

            // Estado
            'status.in' => 'El estado seleccionado no es válido.',

            // Categorías
            'categories.array'  => 'El formato de las categorías no es correcto.',
            'categories.*.exists' => 'Una de las categorías seleccionadas no existe en nuestro sistema.',
        ];
    }

    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json(['error' => true, 'message' => 'No tienes los permisos necesarios para crear un evento.'], 403)
        );
    }
}
