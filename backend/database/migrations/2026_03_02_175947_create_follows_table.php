<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();

            // user_id es el usuario que hace click en seguir.
            //No es necesario especificar el nombre de la tabla en el constrained() porque laravel asume que se refiere a la tabla 'users' por la convención de nombres.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // artist_id es el artista que recibe el seguimiento.
            $table->foreignId('artist_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            //Un usuario no puede seguir al mismo artista dos veces.
            $table->unique(['user_id', 'artist_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
