<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'transfer', 'credit_card', 'debit_card'])
                  ->default('transfer')
                  ->after('payment_type');
            
            // Update payment_type enum values to match new format
            DB::statement("ALTER TABLE `payment_transactions` MODIFY COLUMN `payment_type` ENUM('dp', 'full', 'installment') DEFAULT 'dp'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropColumn('payment_method');
            
            // Revert payment_type enum values
            DB::statement("ALTER TABLE `payment_transactions` MODIFY COLUMN `payment_type` ENUM('DP', 'Pelunasan')");
        });
    }
};
