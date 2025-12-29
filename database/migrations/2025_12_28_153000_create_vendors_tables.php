<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Vendor Categories
        Schema::create('vendor_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Vendors
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('vendor_code')->unique();
            $table->foreignId('category_id')->constrained('vendor_categories')->onDelete('restrict');
            $table->string('company_name');
            $table->string('contact_person');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('alternative_phone')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->enum('status', ['active', 'inactive', 'blacklisted'])->default('active');
            $table->enum('rating_level', ['platinum', 'gold', 'silver', 'bronze', 'standard'])->default('standard');
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->text('services_offered')->nullable(); // JSON
            $table->decimal('minimum_order', 15, 2)->nullable();
            $table->integer('payment_terms_days')->default(0); // 0 = cash, 30 = net 30, etc
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('tax_id')->nullable(); // NPWP
            $table->string('business_license')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('vendor_code');
            $table->index('category_id');
            $table->index('status');
            $table->index('rating_level');
        });

        // Vendor Contracts
        Schema::create('vendor_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('contract_value', 15, 2);
            $table->enum('payment_schedule', ['one_time', 'monthly', 'quarterly', 'per_project'])->default('per_project');
            $table->enum('status', ['draft', 'active', 'expired', 'terminated', 'renewed'])->default('draft');
            $table->text('terms_conditions')->nullable();
            $table->text('deliverables')->nullable(); // JSON
            $table->string('signed_by_vendor')->nullable();
            $table->string('signed_by_company')->nullable();
            $table->date('signed_date')->nullable();
            $table->string('contract_file')->nullable(); // File path
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index('contract_number');
            $table->index('vendor_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });

        // Vendor Ratings & Reviews
        Schema::create('vendor_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('reviewed_by')->constrained('users')->onDelete('cascade');
            $table->integer('rating')->unsigned(); // 1-5
            $table->integer('quality_rating')->unsigned()->nullable(); // 1-5
            $table->integer('timeliness_rating')->unsigned()->nullable(); // 1-5
            $table->integer('professionalism_rating')->unsigned()->nullable(); // 1-5
            $table->integer('value_rating')->unsigned()->nullable(); // 1-5
            $table->text('review')->nullable();
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->boolean('would_recommend')->default(true);
            $table->text('vendor_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->boolean('is_verified')->default(false); // Verified purchase/contract
            $table->timestamps();

            $table->index('vendor_id');
            $table->index('order_id');
            $table->index('rating');
            $table->unique(['vendor_id', 'order_id', 'reviewed_by'], 'unique_vendor_order_review');
        });

        // Vendor Performance Metrics (Optional - for tracking)
        Schema::create('vendor_performance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->year('year');
            $table->tinyInteger('month'); // 1-12
            $table->integer('total_orders')->default(0);
            $table->integer('completed_orders')->default(0);
            $table->integer('cancelled_orders')->default(0);
            $table->decimal('total_revenue', 15, 2)->default(0);
            $table->decimal('average_delivery_time', 8, 2)->default(0); // in days
            $table->integer('on_time_deliveries')->default(0);
            $table->integer('late_deliveries')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->timestamps();

            $table->unique(['vendor_id', 'year', 'month']);
            $table->index(['vendor_id', 'year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_performance');
        Schema::dropIfExists('vendor_ratings');
        Schema::dropIfExists('vendor_contracts');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('vendor_categories');
    }
};
