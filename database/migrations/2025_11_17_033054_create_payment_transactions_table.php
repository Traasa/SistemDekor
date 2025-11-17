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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_type', ['dp', 'full', 'installment'])->default('dp');
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'transfer', 'credit_card', 'debit_card'])->default('transfer');
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
        Schema::dropIfExists('payment_transactions');
    }
};
