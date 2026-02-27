<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'slug', 'description',
        'location', 'event_date', 'price', 'cover_image', 'status'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'price' => 'decimal:2',
        'is_highlighted' => 'boolean',
    ];

    // Relación con el artista (Tu compañera creó la tabla users)
    public function artist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relación muchos a muchos con Categorías
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    // Relación muchos a muchos con Espectadores (Asistentes)
    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_user')
            ->withTimestamps(); // Para saber cuándo se apuntaron
    }
}
