<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
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
            'cancelled'
        ) DEFAULT 'pending_confirmation'");

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM(
            'unpaid',
            'booking_pending',
            'booked',
            'dp_pending',
            'dp_paid',
            'full_pending',
            'paid',
            'partial'
        ) DEFAULT 'unpaid'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending_confirmation',
            'negotiation',
            'awaiting_dp_payment',
            'dp_paid',
            'awaiting_full_payment',
            'paid',
            'confirmed',
            'processing',
            'completed',
            'cancelled'
        ) DEFAULT 'pending_confirmation'");

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM(
            'unpaid',
            'dp_pending',
            'dp_paid',
            'full_pending',
            'paid',
            'partial'
        ) DEFAULT 'unpaid'");
    }
};
