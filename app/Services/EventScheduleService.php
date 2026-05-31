<?php

namespace App\Services;

use App\Models\Event;

class EventScheduleService
{
    public const MAX_EVENTS_PER_DAY = 3;

    public static function countBookedEventsOnDate(string $eventDate, ?int $excludeOrderId = null): int
    {
        $query = Event::query()
            ->whereDate('event_date', $eventDate)
            ->where('status', '!=', 'cancelled');

        if ($excludeOrderId) {
            $query->where('order_id', '!=', $excludeOrderId);
        }

        return $query->count();
    }

    public static function isDateFullyBooked(string $eventDate, ?int $excludeOrderId = null): bool
    {
        return self::countBookedEventsOnDate($eventDate, $excludeOrderId) >= self::MAX_EVENTS_PER_DAY;
    }
}
