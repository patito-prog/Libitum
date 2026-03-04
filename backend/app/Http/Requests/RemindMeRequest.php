<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;

class RemindMeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $event = $this->route('event'); // Captura el {event} de la URL

        // Solo autorizamos si el usuario está inscrito en el evento
        return $user->events()->where('event_id', $event->id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'remind_me' => 'required|boolean'
        ];
    }
    protected function failedAuthorization()
    {
        throw new HttpResponseException(response()->json([
            'error' => true,
            'code' => 403,
            'message' => 'No puedes activar o desactivar recordatorios de un evento en el que no estás inscrito.'
        ], 403));
    }
}
