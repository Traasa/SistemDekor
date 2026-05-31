<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_outline_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->string('title');
            $table->text('description')->nullable();
            $table->time('planned_time')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'skipped'])->default('pending');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['event_id', 'order']);
        });

        $events = DB::table('events')->select('id', 'event_type')->get();

        foreach ($events as $event) {
            $template = [
                ['title' => 'Preparation', 'description' => 'Persiapan kru, perlengkapan, dan briefing internal.', 'planned_time' => '08:00:00'],
                ['title' => 'Setup Venue', 'description' => 'Setup venue dan pengecekan perlengkapan utama.', 'planned_time' => '09:00:00'],
                ['title' => 'Final Check', 'description' => 'Final check teknis dan koordinasi antar tim.', 'planned_time' => '10:00:00'],
                ['title' => 'Start Event', 'description' => 'Acara dimulai sesuai jadwal.', 'planned_time' => '11:00:00'],
                ['title' => 'Main Session', 'description' => 'Sesi inti kegiatan acara berlangsung.', 'planned_time' => '12:00:00'],
                ['title' => 'Closing Event', 'description' => 'Penutupan acara dan evaluasi singkat tim.', 'planned_time' => '14:00:00'],
                ['title' => 'Cleanup', 'description' => 'Bersih-bersih area dan inventarisasi ulang barang.', 'planned_time' => '15:00:00'],
            ];

            if ($event->event_type === 'wedding') {
                $template[0]['planned_time'] = '06:00:00';
                $template[1]['planned_time'] = '07:30:00';
                $template[2]['planned_time'] = '09:00:00';
                $template[3]['planned_time'] = '10:00:00';
                $template[4]['planned_time'] = '11:30:00';
                $template[5]['planned_time'] = '14:00:00';
                $template[6]['planned_time'] = '15:00:00';
            }

            foreach ($template as $index => $item) {
                DB::table('event_outline_items')->insert([
                    'event_id' => $event->id,
                    'order' => $index + 1,
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'planned_time' => $item['planned_time'],
                    'status' => 'pending',
                    'is_default' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('event_outline_items');
    }
};
