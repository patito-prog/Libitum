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
    /**
     * Puede editar el evento su dueño (si tiene el permiso de Spatie) o un admin.
     */
    public function authorize(): bool
    {
        $event = $this->route()->parameter('event');
        $user  = Auth::user();

        $isOwner       = $user->id === $event->user_id;
        $hasPermission = $user->can('editar evento');
        $isAdmin       = $user->hasRole('admin');

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
            'is_donation' => 'nullable|boolean',
            'status_id' => 'required|exists:statuses,id',
            // Validamos que llegue un array de categorías y que los IDs existan
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'max_capacity'   => 'nullable|integer|min:1',
            'duration_hours' => 'nullable|integer|min:1|max:240',
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
