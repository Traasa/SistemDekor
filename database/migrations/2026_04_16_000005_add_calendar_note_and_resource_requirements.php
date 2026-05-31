<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->text('calendar_note')->nullable()->after('notes');
        });

        Schema::table('task_assignments', function (Blueprint $table) {
            $table->json('resource_requirements')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('task_assignments', function (Blueprint $table) {
            $table->dropColumn('resource_requirements');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('calendar_note');
        });
    }
};
