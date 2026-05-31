<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventOutlineItem;

class EventOutlineTemplateService
{
    /**
     * Seed default event outline if event has no outline yet.
     */
    public static function ensureDefaultOutline(Event $event): void
    {
        if ($event->eventOutlineItems()->exists()) {
            return;
        }

        $templates = [
            'wedding' => [
                ['title' => 'Preparation', 'description' => 'Persiapan kru, perlengkapan, dan briefing internal.', 'planned_time' => '06:00:00'],
                ['title' => 'Setup Venue', 'description' => 'Setup dekorasi utama, meja tamu, dan area pendukung.', 'planned_time' => '07:30:00'],
                ['title' => 'Final Check', 'description' => 'Final check rundown, sound system, lighting, dan koordinasi PIC.', 'planned_time' => '09:00:00'],
                ['title' => 'Start Event', 'description' => 'Acara dimulai sesuai jam yang disepakati dengan client.', 'planned_time' => '10:00:00'],
                ['title' => 'Main Session', 'description' => 'Puncak rangkaian acara dan layanan tamu utama.', 'planned_time' => '11:30:00'],
                ['title' => 'Closing Event', 'description' => 'Penutupan acara dan dokumentasi akhir.', 'planned_time' => '14:00:00'],
                ['title' => 'Cleanup', 'description' => 'Pembongkaran, pembersihan area, dan serah terima lokasi.', 'planned_time' => '15:00:00'],
            ],
            'default' => [
                ['title' => 'Preparation', 'description' => 'Persiapan kru, perlengkapan, dan briefing internal.', 'planned_time' => '08:00:00'],
                ['title' => 'Setup Venue', 'description' => 'Setup venue dan pengecekan perlengkapan utama.', 'planned_time' => '09:00:00'],
                ['title' => 'Final Check', 'description' => 'Final check teknis dan koordinasi antar tim.', 'planned_time' => '10:00:00'],
                ['title' => 'Start Event', 'description' => 'Acara dimulai sesuai jadwal.', 'planned_time' => '11:00:00'],
                ['title' => 'Main Session', 'description' => 'Sesi inti kegiatan acara berlangsung.', 'planned_time' => '12:00:00'],
                ['title' => 'Closing Event', 'description' => 'Penutupan acara dan evaluasi singkat tim.', 'planned_time' => '14:00:00'],
                ['title' => 'Cleanup', 'description' => 'Bersih-bersih area dan inventarisasi ulang barang.', 'planned_time' => '15:00:00'],
            ],
        ];

        $selectedTemplate = $templates[$event->event_type] ?? $templates['default'];

        foreach ($selectedTemplate as $index => $item) {
            EventOutlineItem::create([
                'event_id' => $event->id,
                'order' => $index + 1,
                'title' => $item['title'],
                'description' => $item['description'],
                'planned_time' => $item['planned_time'],
                'status' => 'pending',
                'is_default' => true,
            ]);
        }
    }
}
