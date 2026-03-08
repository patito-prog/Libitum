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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            // Relación con el artista (User)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('location'); // Ciudad o zona
            $table->dateTime('event_date');
            $table->decimal('price', 8, 2)->default(0.00);
            $table->string('cover_image')->nullable();

            // Campos extra para lógica de negocio
            $table->integer('max_capacity')->nullable();
            $table->foreignId('status_id')->default(1)->constrained(); //   Relación con el estado del evento.

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
