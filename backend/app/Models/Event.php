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
        'location', 'latitude', 'longitude',
        'event_date', 'price', 'cover_image', 'max_capacity', 'status_id'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'price' => 'decimal:2',
        'latitude' => 'float',
        'longitude' => 'float',
        'is_highlighted' => 'boolean',
    ];

    // Relación con el artista (Qué artista ha hecho este evento)
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
    // Los usuarios que estén apuntados o hayan asistido.
    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'event_user')
            ->withTimestamps(); // Para saber cuándo se apuntaron
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }
}
