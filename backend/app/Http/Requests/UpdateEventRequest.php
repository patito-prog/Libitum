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
        $event=$this->route()->parameter('event');
        //  2. Recogemos el usuario.
        $user = Auth::getUser();
        //  3. Comprobamos que tiene permiso.
        if(!$user || $user->id!=$event->user_id){
            abort(403, 'No tienes permiso para editar este evento.');
        }
        return true;
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
        ];
    }

    public function messages(): array{
        return [
            'title.required' => 'Event title is required',
        ];
    }
}
