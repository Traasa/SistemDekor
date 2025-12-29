<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->string('event_code')->unique();
            $table->string('event_name');
            $table->enum('event_type', ['wedding', 'birthday', 'corporate', 'engagement', 'anniversary', 'graduation', 'other']);
            $table->dateTime('event_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('venue_name');
            $table->text('venue_address');
            $table->integer('guest_count')->nullable();
            $table->enum('status', ['planning', 'confirmed', 'preparation', 'ongoing', 'completed', 'cancelled'])->default('planning');
            $table->text('notes')->nullable();
            $table->text('special_requests')->nullable();
            $table->json('contact_persons')->nullable(); // Array of PIC with name, phone, role
            $table->timestamps();
            
            $table->index('event_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
