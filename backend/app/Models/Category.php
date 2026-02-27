<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model // Recomendado: Singular
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',  // Para URLs bonitas: /eventos/rock-and-roll
        'icon',  // Nombre del icono para React (ej: 'Music', 'Mic')
        'color'  // Código HEX para el estilo (ej: '#FF5733')
    ];

    /**
     * Relación Muchos a Muchos con Eventos.
     * Una categoría (ej: Rock) pertenece a muchos eventos.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class);
    }
}
