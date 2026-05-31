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
            $table->boolean('is_venue_included')->default(false)->after('event_location');
            $table->foreignId('venue_id')->nullable()->after('is_venue_included')->constrained('venues')->nullOnDelete();
            $table->decimal('venue_price', 15, 2)->default(0)->after('venue_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('venue_id');
            $table->dropColumn(['is_venue_included', 'venue_price']);
        });
    }
};
