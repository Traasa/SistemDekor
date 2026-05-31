<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Package;
use App\Models\TaskAssignment;
use App\Models\User;

class EventTaskTemplateService
{
    public static function ensureDefaultTasks(Event $event, ?int $preferredUserId = null): void
    {
        if ($event->taskAssignments()->exists()) {
            return;
        }

        if (!in_array($event->status, ['confirmed', 'preparation', 'ongoing', 'completed'], true)) {
            return;
        }

        $assigneeId = $preferredUserId ?: User::query()->value('id');
        if (!$assigneeId) {
            return;
        }

        $event->loadMissing(['order.package.inventoryItems.category']);
        $package = $event->order?->package;

        if ($package && $package->inventoryItems->isNotEmpty()) {
            self::createPackageBasedTasks($event, $package, $assigneeId);
            self::createBriefingTask($event, $assigneeId);
            return;
        }

        $templates = [
            ['task_name' => 'Checklist Barang Dekorasi', 'description' => 'Verifikasi barang dekorasi utama sesuai kebutuhan event.', 'priority' => 'high'],
            ['task_name' => 'Checklist Makanan & Catering', 'description' => 'Pastikan item catering dan konsumsi sesuai jumlah tamu.', 'priority' => 'high'],
            ['task_name' => 'Checklist Tambahan Request Client', 'description' => 'Validasi item tambahan khusus dari permintaan client.', 'priority' => 'medium'],
            ['task_name' => 'Briefing Tim Operasional', 'description' => 'Koordinasi PIC, vendor, dan kru sebelum acara dimulai.', 'priority' => 'medium'],
        ];

        foreach ($templates as $template) {
            TaskAssignment::create([
                'event_id' => $event->id,
                'user_id' => $assigneeId,
                'task_name' => $template['task_name'],
                'description' => $template['description'],
                'priority' => $template['priority'],
                'status' => 'assigned',
                'resource_requirements' => [],
            ]);
        }
    }

    private static function createPackageBasedTasks(Event $event, Package $package, int $assigneeId): void
    {
        $groupLabels = [
            'catering' => 'Catering',
            'dekor' => 'Dekor',
            'makeup' => 'Makeup',
            'sound' => 'Sound',
            'lainnya' => 'Lainnya',
        ];

        $grouped = $package->inventoryItems->groupBy(function ($item) {
            return $item->category?->category_group ?: 'lainnya';
        });

        foreach ($grouped as $group => $items) {
            $requirements = $items->map(function ($item) use ($group) {
                return [
                    'inventory_item_id' => (int) $item->id,
                    'item_name' => $item->name,
                    'item_unit' => $item->unit,
                    'category_name' => $item->category?->name,
                    'category_group' => $item->category?->category_group ?: 'lainnya',
                    'requirement_type' => $group === 'catering' ? 'catering' : 'equipment',
                    'quantity' => (int) ($item->pivot->quantity ?? 1),
                    'notes' => $item->pivot->notes,
                ];
            })->values()->toArray();

            TaskAssignment::create([
                'event_id' => $event->id,
                'user_id' => $assigneeId,
                'task_name' => 'Persiapan Item Paket - ' . ($groupLabels[$group] ?? ucfirst((string) $group)),
                'description' => 'Task otomatis dari item paket wedding yang dipilih oleh client/admin.',
                'priority' => in_array($group, ['catering', 'dekor'], true) ? 'high' : 'medium',
                'status' => 'assigned',
                'resource_requirements' => $requirements,
            ]);
        }
    }

    private static function createBriefingTask(Event $event, int $assigneeId): void
    {
        TaskAssignment::create([
            'event_id' => $event->id,
            'user_id' => $assigneeId,
            'task_name' => 'Briefing Tim Operasional',
            'description' => 'Koordinasi akhir rundown, vendor, dan kebutuhan item paket sebelum acara.',
            'priority' => 'medium',
            'status' => 'assigned',
            'resource_requirements' => [],
        ]);
    }
}
