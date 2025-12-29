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
        // Employees Table
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code', 50)->unique();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('phone', 20);
            $table->enum('position', [
                'event_coordinator',
                'decorator',
                'photographer',
                'videographer',
                'mc',
                'sound_technician',
                'lighting_technician',
                'caterer',
                'driver',
                'admin',
                'manager',
                'other'
            ]);
            $table->string('department', 50)->nullable();
            $table->date('join_date');
            $table->enum('employment_type', ['full_time', 'part_time', 'freelance', 'intern'])->default('full_time');
            $table->enum('status', ['active', 'inactive', 'on_leave', 'terminated'])->default('active');
            $table->text('address')->nullable();
            $table->string('city', 50)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->decimal('salary', 15, 2)->nullable();
            $table->json('skills')->nullable(); // Array of skills
            $table->text('notes')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'position']);
            $table->index('employment_type');
        });

        // Employee Schedules Table
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('date');
            $table->time('shift_start');
            $table->time('shift_end');
            $table->enum('shift_type', ['morning', 'afternoon', 'evening', 'night', 'full_day'])->default('full_day');
            $table->enum('status', ['scheduled', 'confirmed', 'cancelled', 'completed'])->default('scheduled');
            $table->string('location', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['employee_id', 'date']);
            $table->index(['date', 'status']);
            $table->unique(['employee_id', 'date', 'shift_start']); // Prevent double booking
        });

        // Employee Assignments Table (to orders/events)
        Schema::create('employee_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('role', 50); // Role in this specific event
            $table->date('assignment_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('status', ['assigned', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('assigned');
            $table->decimal('fee', 15, 2)->nullable(); // Payment for this assignment
            $table->text('tasks')->nullable(); // Specific tasks
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['employee_id', 'assignment_date']);
            $table->index(['order_id', 'status']);
        });

        // Employee Attendance Table
        Schema::create('employee_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->enum('status', ['present', 'late', 'absent', 'on_leave', 'sick', 'half_day'])->default('present');
            $table->enum('leave_type', ['sick', 'annual', 'unpaid', 'emergency', 'other'])->nullable();
            $table->text('notes')->nullable();
            $table->string('location')->nullable(); // Check-in location
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->unique(['employee_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_attendances');
        Schema::dropIfExists('employee_assignments');
        Schema::dropIfExists('employee_schedules');
        Schema::dropIfExists('employees');
    }
};
