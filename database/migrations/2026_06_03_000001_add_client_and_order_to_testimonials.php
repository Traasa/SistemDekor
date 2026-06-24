<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('id');
            $table->unsignedBigInteger('order_id')->nullable()->after('client_id');

            $table->index('client_id');
            $table->unique('order_id');

            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['order_id']);
            $table->dropUnique(['order_id']);
            $table->dropIndex(['client_id']);
            $table->dropColumn(['client_id', 'order_id']);
        });
    }
};
