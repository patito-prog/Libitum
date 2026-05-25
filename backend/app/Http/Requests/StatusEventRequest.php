<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class StatusEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) return true;
        $event = $this->route('event');
        $hasPermission = $user->hasPermissionTo('editar evento');
        $isOwner = $user->id === $event->user_id;
        return $hasPermission && $isOwner;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status_id' => 'required|exists:statuses,id'
        ];
    }

    public function messages(): array
    {
        return [
            'status_id.required' => 'El estado es requerido para poder acutalizarse.',
            'status_id.exists' => 'El estado no es válido, no existe.'
        ];
    }


    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json(['error' => true, 'message' => 'No tienes permiso para modificar el estado de este evento.'], 403)
        );
    }
}
