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
        Schema::create('mini_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('vendor_client_id')->constrained('vendor_clients')->cascadeOnDelete();
            $table->string('event_name');
            $table->string('event_type')->default('mini');
            $table->date('event_date');
            $table->text('event_address');
            $table->string('event_location')->nullable();
            $table->decimal('total_price', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('final_price', 15, 2)->default(0);
            $table->decimal('dp_amount', 15, 2)->default(0);
            $table->decimal('booking_amount', 12, 2)->nullable();
            $table->enum('initial_payment_type', ['booking', 'dp'])->nullable();
            $table->decimal('deposit_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->enum('status', [
                'pending_confirmation',
                'negotiation',
                'awaiting_booking_payment',
                'booked',
                'awaiting_dp_payment',
                'dp_paid',
                'awaiting_full_payment',
                'paid',
                'confirmed',
                'processing',
                'completed',
                'cancelled',
            ])->default('pending_confirmation');
            $table->enum('payment_status', [
                'unpaid',
                'booking_pending',
                'booked',
                'dp_pending',
                'dp_paid',
                'full_pending',
                'paid',
                'partial',
            ])->default('unpaid');
            $table->string('payment_link_token')->nullable();
            $table->enum('payment_link_type', ['booking', 'dp', 'installment', 'full'])->nullable();
            $table->decimal('payment_link_amount', 12, 2)->nullable();
            $table->timestamp('payment_link_expires_at')->nullable();
            $table->boolean('payment_link_active')->default(false);
            $table->text('notes')->nullable();
            $table->text('special_requests')->nullable();
            $table->json('custom_items')->nullable();
            $table->decimal('additional_costs', 15, 2)->default(0);
            $table->text('negotiation_notes')->nullable();
            $table->boolean('is_negotiable')->default(true);
            $table->timestamp('negotiated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mini_orders');
    }
};
