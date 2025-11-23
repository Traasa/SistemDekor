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
            $table->string('payment_link_token')->unique()->nullable()->after('payment_status');
            $table->timestamp('payment_link_expires_at')->nullable()->after('payment_link_token');
            $table->boolean('payment_link_active')->default(false)->after('payment_link_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_link_token', 'payment_link_expires_at', 'payment_link_active']);
        });
    }
};
