<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailLibitum;
use App\Notifications\ResetPasswordLibitum;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

/**
 * Modelo de Usuario (sirve para los tres roles: espectador, artista y admin,
 * gestionados con Spatie). Centraliza las relaciones: perfil de artista,
 * seguidores/seguidos, eventos creados, asistencias y likes.
 *
 * Implementa MustVerifyEmail: el usuario debe confirmar su correo (pinchando
 * el enlace que le mandamos) antes de poder iniciar sesión.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Sobreescribimos el envío de la notificación de verificación para usar
     * nuestra plantilla con la marca Libitum en vez del email genérico de Laravel.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailLibitum());
    }

    /**
     * Igual que arriba, pero para el correo de "restablecer contraseña": usamos
     * nuestra plantilla y un enlace que apunta al frontend (no al backend).
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordLibitum($token));
    }

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
        'avatar_url',
        'city',
        'last_connection',
    ];

    public function artistProfile()
    {
        return $this->hasOne(ArtistProfile::class);
    }

    /**
     * Artistas a los que ESTE usuario sigue.
     * Relación N:M sobre la tabla pivote 'follows': user_id (quien sigue) →
     * artist_id (a quién sigue). withTimestamps guarda cuándo se dio el follow.
     */
    public function following() : \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'artist_id')->withTimestamps();
    }

    /**
     * Seguidores de este artista. Es la relación inversa de following():
     * mismas claves pero invertidas (artist_id → user_id).
     */
    public function followers() : \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'artist_id', 'user_id')->withTimestamps();
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
        return $this->belongsToMany(Event::class, 'event_user')->withPivot('remind_me')
            ->withTimestamps();
    }

    /**
     * Eventos creados por el Artista.
     */
    public function createdEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        //  Relación 1:N: Un usuario crea muchos eventos.
        return $this->hasMany(Event::class, 'user_id');
    }

    //PARA LOS LIKES
    public function likes() {
        return $this->belongsToMany(Event::class, 'likes')->withTimestamps();
    }
}
