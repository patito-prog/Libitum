<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marca un evento como de "donación voluntaria": la entrada es gratis y el
 * público colabora si quiere (el clásico pasar la gorra). Evita obligar al
 * artista a poner precio 0.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('is_donation')->default(false)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('is_donation');
        });
    }
};
