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
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('capacity');
            $table->integer('min_capacity')->default(0);
            $table->string('venue_type'); // indoor, outdoor, semi-outdoor, ballroom, garden, etc
            $table->json('facilities')->nullable(); // AC, parking, sound system, etc
            $table->json('images')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('venue_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->string('day_type'); // weekday, weekend, holiday
            $table->string('session_type'); // full_day, morning, afternoon, evening
            $table->decimal('base_price', 15, 2);
            $table->decimal('additional_hour_price', 15, 2)->nullable();
            $table->integer('min_hours')->default(1);
            $table->integer('max_hours')->nullable();
            $table->decimal('overtime_price', 15, 2)->nullable();
            $table->decimal('cleaning_fee', 15, 2)->default(0);
            $table->decimal('security_deposit', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('venue_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->string('booking_number')->unique();
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('status'); // pending, confirmed, cancelled, completed
            $table->string('client_name');
            $table->string('client_phone');
            $table->string('client_email')->nullable();
            $table->string('event_type')->nullable();
            $table->integer('guest_count')->nullable();
            $table->decimal('total_price', 15, 2);
            $table->text('special_requests')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('venue_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->boolean('is_available')->default(true);
            $table->string('unavailable_reason')->nullable(); // maintenance, booked, special_event, etc
            $table->time('available_from')->nullable();
            $table->time('available_until')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['venue_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venue_availability');
        Schema::dropIfExists('venue_bookings');
        Schema::dropIfExists('venue_pricing');
        Schema::dropIfExists('venues');
    }
};
