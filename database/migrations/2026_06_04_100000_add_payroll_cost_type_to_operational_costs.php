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
        // Add 'payroll' to cost_type enum
        DB::statement("ALTER TABLE operational_costs MODIFY COLUMN cost_type ENUM('production', 'catering_raw_material', 'other', 'payroll') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'payroll' from cost_type enum
        DB::statement("ALTER TABLE operational_costs MODIFY COLUMN cost_type ENUM('production', 'catering_raw_material', 'other') NOT NULL");
    }
};
