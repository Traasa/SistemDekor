<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rundown_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0); // Urutan acara
            $table->time('time'); // Waktu mulai
            $table->integer('duration')->default(30); // Durasi dalam menit
            $table->string('activity'); // Nama aktivitas
            $table->text('description')->nullable();
            $table->string('pic')->nullable(); // Person in charge
            $table->text('notes')->nullable();
            $table->json('equipment_needed')->nullable(); // Peralatan yang dibutuhkan
            $table->boolean('is_critical')->default(false); // Acara penting (gak boleh telat)
            $table->enum('status', ['pending', 'in_progress', 'completed', 'skipped'])->default('pending');
            $table->timestamps();
            
            $table->index('event_id');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rundown_items');
    }
};
