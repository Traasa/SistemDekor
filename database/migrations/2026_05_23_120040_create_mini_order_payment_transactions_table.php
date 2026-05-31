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
        Schema::create('mini_order_payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mini_order_id')->constrained('mini_orders')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('payment_type', ['booking', 'dp', 'installment', 'full']);
            $table->string('payment_method')->nullable();
            $table->date('payment_date')->nullable();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('proof_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mini_order_payment_transactions');
    }
};
