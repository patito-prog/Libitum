<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Añade el número de Bizum al perfil del artista. Es opcional: el artista que
 * no tenga PayPal/Ko-fi puede poner su móvil para que le hagan un Bizum
 * (bajo su responsabilidad, ya que el número queda visible).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artist_profiles', function (Blueprint $table) {
            $table->string('bizum_phone', 20)->nullable()->after('donation_url');
        });
    }

    public function down(): void
    {
        Schema::table('artist_profiles', function (Blueprint $table) {
            $table->dropColumn('bizum_phone');
        });
    }
};
