<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        //  1. Recoge el evento por el ID que está dentro del parámetro.
        $event = $this->route()->parameter('event');
        //  2. Recogemos el usuario.
        $user = Auth::user();
        // 3. ¿Es el dueño del evento?.
        $isOwner = $user->id === $event->user_id;
        // 4. ¿Tiene el permiso de Spatie para editar eventos?.
        $hasPermission = $user->can('editar evento');
        // 5. ¿Es el administrador? (El admin puede editar todo).
        $isAdmin = $user->hasRole('admin');
        // Devolvemos TRUE si es el dueño con permiso || si es admin.
        return ($isOwner && $hasPermission) || $isAdmin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'=>'required|string|max:255',
            'description' => 'string',
            'location' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'event_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
            'status_id' => 'required|exists:statuses,id',
            // Validamos que llegue un array de categorías y que los IDs existan
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'      => 'El título del evento es obligatorio.',
            'location.required'   => 'La ubicación es obligatoria.',
            'event_date.required' => 'La fecha del evento es obligatoria.',
            'status_id.required'  => 'El estado es obligatorio.',
            'status_id.exists'    => 'El estado seleccionado no existe.',
            'categories.*.exists' => 'Una de las categorías seleccionadas no es válida.',
        ];
    }

    public function attributes(): array
    {
        return [
            'status_id'    => 'estado',
            'event_date'   => 'fecha del evento',
            'title'        => 'título',
            'description'  => 'descripción',
            'price'        => 'precio',
        ];
    }

    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json(['error' => true, 'message' => 'Debes ser el dueño del evento o al menos tener permisos.'], 403)
        );
    }
}
