<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Datos extra del perfil público de un artista (bio, redes y enlace de donación).
 * Va 1:1 con un User de rol artista; se crea al pasar a ese rol.
 */
class ArtistProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'spotify_url',
        'instagram_url',
        'youtube_url',
        'tiktok_url',
        'donation_url',
        'bizum_phone',
    ];

    /** Usuario (artista) dueño de este perfil. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
