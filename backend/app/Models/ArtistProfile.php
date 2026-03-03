<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
