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
        Schema::table('packages', function (Blueprint $table) {
            $table->boolean('includes_venue')->default(false)->after('base_price');
            $table->foreignId('venue_id')->nullable()->after('includes_venue')->constrained('venues')->nullOnDelete();
            $table->decimal('venue_price', 15, 2)->default(0)->after('venue_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('venue_id');
            $table->dropColumn(['includes_venue', 'venue_price']);
        });
    }
};
