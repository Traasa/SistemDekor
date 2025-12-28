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
            $table->json('package_details')->nullable()->after('package_id');
            $table->json('custom_items')->nullable()->after('package_details');
            $table->decimal('additional_costs', 15, 2)->default(0)->after('custom_items');
            $table->text('negotiation_notes')->nullable()->after('additional_costs');
            $table->boolean('is_negotiable')->default(true)->after('negotiation_notes');
            $table->timestamp('negotiated_at')->nullable()->after('is_negotiable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'package_details',
                'custom_items',
                'additional_costs',
                'negotiation_notes',
                'is_negotiable',
                'negotiated_at',
            ]);
        });
    }
};
