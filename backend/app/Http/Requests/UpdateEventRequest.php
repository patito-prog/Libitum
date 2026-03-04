<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
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
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'event_date' => 'required|date',
            'price' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,cancelled',
            // Validamos que llegue un array de categorías y que los IDs existan
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ];
    }

    public function messages(): array{
        return [
            'title.required' => 'Event title is required',
            'categories.*.exists' => 'Una de las categorías seleccionadas no es válida.',
        ];
    }
}
