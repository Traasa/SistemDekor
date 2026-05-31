<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_categories', function (Blueprint $table) {
            $table->enum('category_group', ['catering', 'dekor', 'makeup', 'sound', 'lainnya'])
                ->default('lainnya')
                ->after('code');
        });

        DB::statement("UPDATE inventory_categories
            SET category_group = CASE
                WHEN LOWER(name) LIKE '%cater%' OR LOWER(code) LIKE '%cater%' OR LOWER(name) LIKE '%makan%' THEN 'catering'
                WHEN LOWER(name) LIKE '%dekor%' OR LOWER(code) LIKE '%dekor%' OR LOWER(name) LIKE '%decor%' THEN 'dekor'
                WHEN LOWER(name) LIKE '%makeup%' OR LOWER(code) LIKE '%mua%' OR LOWER(name) LIKE '%rias%' THEN 'makeup'
                WHEN LOWER(name) LIKE '%sound%' OR LOWER(code) LIKE '%audio%' THEN 'sound'
                ELSE 'lainnya'
            END");
    }

    public function down(): void
    {
        Schema::table('inventory_categories', function (Blueprint $table) {
            $table->dropColumn('category_group');
        });
    }
};
