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
            $table->string('order_number')->unique()->after('id');
            $table->string('event_name')->after('client_id');
            $table->string('event_type')->after('event_name'); // wedding, birthday, corporate, etc
            $table->integer('guest_count')->default(0)->after('event_address');
            $table->decimal('dp_amount', 15, 2)->default(0)->after('total_price');
            $table->text('special_requests')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_number',
                'event_name',
                'event_type',
                'guest_count',
                'dp_amount',
                'special_requests'
            ]);
        });
    }
};
