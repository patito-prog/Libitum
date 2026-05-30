<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Modelo de Evento.
 *
 * Pertenece a un artista (user_id) y se relaciona con categorías, estado,
 * asistentes (event_user) y likes. Lo más particular es `effective_status_name`:
 * un atributo calculado que deriva el estado real del evento a partir de su
 * fecha y duración (ver getEffectiveStatusNameAttribute), en vez de fiarse solo
 * del estado guardado en BD.
 */
class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'slug', 'description',
        'location', 'latitude', 'longitude',
        'event_date', 'duration_hours', 'price', 'is_donation', 'cover_image', 'max_capacity', 'status_id',
    ];

    protected $casts = [
        'event_date'     => 'datetime',
        'price'          => 'decimal:2',
        'is_donation'    => 'boolean',
        'latitude'       => 'float',
        'longitude'      => 'float',
        'duration_hours' => 'integer',
        'is_highlighted' => 'boolean',
    ];

    protected $appends = ['effective_status_name'];

    /**
     * Estado efectivo calculado a partir de la fecha real del evento.
     * draft y cancelled NO se tocan (son decisiones manuales del artista).
     * El resto se calcula con la fecha de inicio y la duración:
     *   - ya pasó el final (inicio + duración) → finished
     *   - estamos entre el inicio y el final    → live
     *   - aún no ha empezado                     → published
     */
    public function getEffectiveStatusNameAttribute(): string
    {
        $stored = $this->status?->name ?? 'draft';

        // draft y cancelled nunca cambian automáticamente
        if (in_array($stored, ['draft', 'cancelled'])) return $stored;

        if (!$this->event_date) return $stored;

        $now      = now();
        $start    = $this->event_date;
        $duration = $this->duration_hours ?? 2; // 2h por defecto si no se especifica
        $end      = $start->copy()->addHours($duration);

        if ($now->gte($end))    return 'finished'; // ya terminó
        if ($now->gte($start))  return 'live';     // en curso
        return 'published';                        // aún no ha comenzado
    }

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

    //PARA LOS LIKES
    public function likedBy() {
        return $this->belongsToMany(User::class, 'likes');
    }
}
