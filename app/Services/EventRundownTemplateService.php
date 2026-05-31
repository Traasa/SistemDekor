<?php

namespace App\Services;

use App\Models\Event;
use App\Models\RundownItem;

class EventRundownTemplateService
{
    public static function ensureDefaultRundown(Event $event): void
    {
        if ($event->rundownItems()->exists()) {
            return;
        }

        $templates = [
            'wedding' => [
                ['time' => '06:00:00', 'duration' => 120, 'activity' => 'Persiapan Tim & Briefing', 'description' => 'Briefing kru, cek kebutuhan venue, dan pembagian peran.', 'is_critical' => true],
                ['time' => '08:00:00', 'duration' => 120, 'activity' => 'Setup Dekorasi & Peralatan', 'description' => 'Pemasangan dekorasi utama, sound system, dan area tamu.', 'is_critical' => true],
                ['time' => '10:00:00', 'duration' => 30, 'activity' => 'Final Check Vendor', 'description' => 'Final check dengan vendor, MC, dan keluarga inti.', 'is_critical' => true],
                ['time' => '10:30:00', 'duration' => 60, 'activity' => 'Akad / Prosesi Utama', 'description' => 'Sesi prosesi utama sesuai kesepakatan rundown client.', 'is_critical' => true],
                ['time' => '11:30:00', 'duration' => 90, 'activity' => 'Resepsi & Sesi Tamu', 'description' => 'Penerimaan tamu dan dokumentasi sesi utama.', 'is_critical' => false],
                ['time' => '13:00:00', 'duration' => 60, 'activity' => 'Sesi Foto & Interaksi', 'description' => 'Sesi foto keluarga dan tamu prioritas.', 'is_critical' => false],
                ['time' => '14:00:00', 'duration' => 30, 'activity' => 'Closing Acara', 'description' => 'Penutupan formal acara dan ucapan terima kasih.', 'is_critical' => false],
                ['time' => '14:30:00', 'duration' => 120, 'activity' => 'Bongkar & Cleanup', 'description' => 'Pembongkaran, inventarisasi, dan pembersihan venue.', 'is_critical' => true],
            ],
            'default' => [
                ['time' => '08:00:00', 'duration' => 90, 'activity' => 'Persiapan Tim', 'description' => 'Briefing tim dan kesiapan perlengkapan.', 'is_critical' => true],
                ['time' => '09:30:00', 'duration' => 90, 'activity' => 'Setup Venue', 'description' => 'Setup area event, dekorasi, dan teknis.', 'is_critical' => true],
                ['time' => '11:00:00', 'duration' => 30, 'activity' => 'Final Check', 'description' => 'Pengecekan akhir sebelum acara dimulai.', 'is_critical' => true],
                ['time' => '11:30:00', 'duration' => 120, 'activity' => 'Main Event Session', 'description' => 'Sesi utama event berlangsung.', 'is_critical' => false],
                ['time' => '13:30:00', 'duration' => 30, 'activity' => 'Closing', 'description' => 'Penutupan sesi acara.', 'is_critical' => false],
                ['time' => '14:00:00', 'duration' => 90, 'activity' => 'Cleanup', 'description' => 'Pembersihan area dan rapih inventaris.', 'is_critical' => true],
            ],
        ];

        $template = $templates[$event->event_type] ?? $templates['default'];

        foreach ($template as $index => $item) {
            RundownItem::create([
                'event_id' => $event->id,
                'order' => $index + 1,
                'time' => $item['time'],
                'duration' => $item['duration'],
                'activity' => $item['activity'],
                'description' => $item['description'],
                'is_critical' => $item['is_critical'],
                'status' => 'pending',
            ]);
        }
    }
}
