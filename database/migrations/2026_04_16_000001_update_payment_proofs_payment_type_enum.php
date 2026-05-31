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
        DB::statement("ALTER TABLE `payment_proofs` MODIFY COLUMN `payment_type` ENUM('dp', 'installment', 'full') DEFAULT 'dp'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `payment_proofs` MODIFY COLUMN `payment_type` ENUM('dp', 'full') DEFAULT 'dp'");
    }
};
