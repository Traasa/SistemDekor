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
        Schema::table('orders', function (Blueprint $table) {
            // Make user_id nullable for client orders (if not already)
            if (Schema::hasColumn('orders', 'user_id')) {
                $table->foreignId('user_id')->nullable()->change();
            }
            
            // Add new fields for client checkout (only if they don't exist)
            if (!Schema::hasColumn('orders', 'event_location')) {
                $table->string('event_location')->nullable()->after('event_date');
            }
            
            if (!Schema::hasColumn('orders', 'event_theme')) {
                $table->string('event_theme')->nullable()->after('event_location');
            }
            
            if (!Schema::hasColumn('orders', 'discount')) {
                $table->decimal('discount', 15, 2)->default(0)->after('total_price');
            }
            
            if (!Schema::hasColumn('orders', 'final_price')) {
                $table->decimal('final_price', 15, 2)->after('discount');
            }
            
            if (!Schema::hasColumn('orders', 'deposit_amount')) {
                $table->decimal('deposit_amount', 15, 2)->default(0)->after('final_price');
            }
            
            if (!Schema::hasColumn('orders', 'remaining_amount')) {
                $table->decimal('remaining_amount', 15, 2)->after('deposit_amount');
            }
            
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid')->after('status');
            }
        });
        
        // Update status enum to include pending_confirmation
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'pending_confirmation', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'event_location',
                'event_theme',
                'guest_count',
                'discount',
                'final_price',
                'deposit_amount',
                'remaining_amount',
                'payment_status',
            ]);
            
            // Revert status enum
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending'");
        });
    }
};
