<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'surname',
        'nickname',
        'email',
        'phone_number',
        'phone_number_verified',
        'password',
        'role',
        'avatar_url',
        'city',
        'last_connection',
    ];

    public function artistProfile()
    {
        return $this->hasOne(ArtistProfile::class);
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Los eventos a los que asiste el usuario (como espectador).
     *
     * Es importante por la relación muchos a muchos. Un usuario puede asistir a muchos eventos y un evento tiene muchos asistentes.
     *
     * Laravel necesita saber que para esta relación debe mirar la tabla `event_user`.
     */
    public function events(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_user')
            ->withTimestamps();
    }
}
