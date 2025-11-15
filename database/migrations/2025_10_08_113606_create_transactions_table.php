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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('client_name');
            $table->string('client_email')->nullable();
            $table->string('client_phone')->nullable();
            $table->string('event_type')->default('wedding'); // wedding, engagement, etc
            $table->date('event_date')->nullable();
            $table->string('event_venue')->nullable();
            $table->text('service_detail');
            $table->json('services')->nullable(); // Array of selected services with quantities
            $table->date('transaction_date');
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->decimal('total_price', 15, 2);
            $table->decimal('down_payment', 15, 2)->default(0);
            $table->decimal('remaining_payment', 15, 2)->default(0);
            $table->enum('payment_status', ['unpaid', 'down_payment', 'paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
