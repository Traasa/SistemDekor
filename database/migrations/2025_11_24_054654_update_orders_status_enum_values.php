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
        // Update status ENUM to include all new status values
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

        // Update payment_status ENUM to include all new values
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM(
            'unpaid',
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
        // Revert to old ENUM values
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'pending_confirmation',
            'confirmed',
            'completed',
            'cancelled'
        ) DEFAULT 'pending'");

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM(
            'unpaid',
            'partial',
            'paid'
        ) DEFAULT 'unpaid'");
    }
};
