<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

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

    //Relación de seguidores (followers) y seguidos (following).
    public function following() : \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        //Explicación del método belongsToMany:
        //1. El primer argumento es el modelo con el que queremos establecer la relación, en este caso es el mismo modelo User porque tanto los seguidores como los seguidos son usuarios.
        //2. El segundo argumento es el nombre de la tabla pivote que almacena las relaciones, en este caso es 'follows'.
        //3. El tercer argumento es la clave foránea que representa al usuario que sigue (user_id).
        //4. El cuarto argumento es la clave foránea que representa al artista seguido (artist_id).
        //5. withTimestamps() es un método que le dice a Laravel que también queremos que se gestionen automáticamente los campos created_at y updated_at en la tabla pivote.
        //Con esta relación, cuando llamemos a $user->following, Laravel hará una consulta a la tabla 'follows' para encontrar todas las filas donde 'user_id' sea igual al ID del usuario actual, y luego traerá los usuarios relacionados a través de 'artist_id'.
        return $this->belongsToMany(User::class, 'follows', 'user_id', 'artist_id')->withTimestamps();
    }

    //Los seguidores de un artista.
    public function followers() : \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        //Viendo el método anterior podemos entender que aquí simplemente invertimos el orden de las claves foráneas para obtener la relación inversa, es decir, los usuarios que siguen a un artista específico.
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
        return $this->belongsToMany(Event::class, 'event_user')
            ->withTimestamps();
    }
}
