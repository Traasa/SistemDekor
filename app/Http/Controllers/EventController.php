<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventOutlineItem;
use App\Models\MiniOrder;
use App\Services\EventOutlineTemplateService;
use App\Services\EventScheduleService;
use App\Services\EventRundownTemplateService;
use App\Services\EventTaskTemplateService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['client', 'order', 'eventOutlineItems'])
            ->orderBy('event_date', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by event type
        if ($request->has('event_type') && $request->event_type !== 'all') {
            $query->where('event_type', $request->event_type);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('event_name', 'like', "%{$search}%")
                    ->orWhere('event_code', 'like', "%{$search}%")
                    ->orWhere('venue_name', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        $events = $query->get();

        $eventsCollection = $events->map(function (Event $event) {
            EventOutlineTemplateService::ensureDefaultOutline($event);
            $event->load('eventOutlineItems');
            $data = $event->toArray();
            $data['source'] = 'order';
            return $data;
        });

        $miniOrdersQuery = MiniOrder::with(['vendorClient']);

        if ($request->has('status') && $request->status !== 'all') {
            $miniOrdersQuery->whereIn('status', $this->mapEventStatusToMiniStatuses($request->status));
        }

        if ($request->has('event_type') && $request->event_type !== 'all' && $request->event_type !== 'other') {
            $miniOrdersQuery->whereRaw('1 = 0');
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $miniOrdersQuery->where(function ($q) use ($search) {
                $q->where('event_name', 'like', "%{$search}%")
                    ->orWhere('order_number', 'like', "%{$search}%")
                    ->orWhere('event_location', 'like', "%{$search}%")
                    ->orWhereHas('vendorClient', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('date_from')) {
            $miniOrdersQuery->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $miniOrdersQuery->whereDate('event_date', '<=', $request->date_to);
        }

        $miniOrders = $miniOrdersQuery->get()->map(function (MiniOrder $order) {
            $status = $this->mapMiniStatusToEventStatus($order->status);
            return [
                'id' => $order->id,
                'source' => 'mini',
                'event_code' => $order->order_number,
                'event_name' => $order->event_name,
                'event_type' => 'other',
                'event_type_label' => 'Mini Order',
                'event_date' => $order->event_date?->format('Y-m-d') ?? '',
                'start_time' => null,
                'end_time' => null,
                'venue_name' => $order->event_location ?? '-',
                'guest_count' => 0,
                'status' => $status,
                'status_label' => $this->mapEventStatusLabel($status),
                'calendar_note' => $order->notes,
                'client' => [
                    'name' => $order->vendorClient?->name ?? '-',
                    'phone' => $order->vendorClient?->phone ?? '-',
                ],
                'order' => [
                    'order_number' => $order->order_number,
                ],
                'event_outline_items' => [],
            ];
        });

        $combined = $eventsCollection->concat($miniOrders)->sortByDesc(function ($item) {
            return $item['event_date'] ?? '';
        })->values();

        $perPage = (int) $request->get('per_page', 15);
        $page = LengthAwarePaginator::resolveCurrentPage();
        $paginatedItems = $combined->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedItems,
            $combined->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json($paginator);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'client_id' => 'required|exists:clients,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|in:wedding,birthday,corporate,engagement,anniversary,graduation,other',
            'event_date' => [
                'required',
                'date',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (EventScheduleService::isDateFullyBooked((string) $value)) {
                        $fail('Tanggal event sudah penuh (maksimal 3 event terkonfirmasi per hari).');
                    }
                },
            ],
            'start_time' => 'required',
            'end_time' => 'required',
            'venue_name' => 'required|string|max:255',
            'venue_address' => 'required|string',
            'guest_count' => 'nullable|integer',
            'notes' => 'nullable|string',
            'calendar_note' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'contact_persons' => 'nullable|array',
        ]);

        $event = Event::create($validated);

        // Generate default high-level event outline (separate from rundown).
        EventOutlineTemplateService::ensureDefaultOutline($event);
        EventRundownTemplateService::ensureDefaultRundown($event);
        EventTaskTemplateService::ensureDefaultTasks($event, auth()->id());

        return response()->json($event->load(['client', 'order', 'eventOutlineItems', 'rundownItems']), 201);
    }

    public function show(Event $event)
    {
        return response()->json($event->load([
            'client',
            'order.orderDetails.service',
            'eventOutlineItems',
            'rundownItems',
            'taskAssignments.user'
        ]));
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'event_name' => 'sometimes|string|max:255',
            'event_type' => 'sometimes|in:wedding,birthday,corporate,engagement,anniversary,graduation,other',
            'event_date' => [
                'sometimes',
                'date',
                function (string $attribute, mixed $value, \Closure $fail) use ($event) {
                    if (EventScheduleService::isDateFullyBooked((string) $value, $event->order_id)) {
                        $fail('Tanggal event sudah penuh (maksimal 3 event terkonfirmasi per hari).');
                    }
                },
            ],
            'start_time' => 'sometimes',
            'end_time' => 'sometimes',
            'venue_name' => 'sometimes|string|max:255',
            'venue_address' => 'sometimes|string',
            'guest_count' => 'nullable|integer',
            'status' => 'sometimes|in:planning,confirmed,preparation,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
            'calendar_note' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'contact_persons' => 'nullable|array',
        ]);

        $event->update($validated);

        EventTaskTemplateService::ensureDefaultTasks($event->fresh(['taskAssignments']), auth()->id());

        return response()->json($event->load(['client', 'order']));
    }

    public function outlines(Event $event)
    {
        EventOutlineTemplateService::ensureDefaultOutline($event);
        return response()->json(['data' => $event->eventOutlineItems()->orderBy('order')->get()]);
    }

    public function storeOutline(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'planned_time' => 'nullable',
            'status' => 'nullable|in:pending,in_progress,completed,skipped',
        ]);

        $maxOrder = $event->eventOutlineItems()->max('order') ?? 0;

        $outline = EventOutlineItem::create([
            'event_id' => $event->id,
            'order' => $maxOrder + 1,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'planned_time' => $validated['planned_time'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'is_default' => false,
        ]);

        return response()->json($outline, 201);
    }

    public function updateOutline(Request $request, Event $event, EventOutlineItem $eventOutlineItem)
    {
        if ((int) $eventOutlineItem->event_id !== (int) $event->id) {
            return response()->json(['message' => 'Outline item tidak valid untuk event ini'], 422);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'planned_time' => 'nullable',
            'status' => 'sometimes|in:pending,in_progress,completed,skipped',
            'order' => 'sometimes|integer|min:1',
        ]);

        $eventOutlineItem->update($validated);

        return response()->json($eventOutlineItem->fresh());
    }

    public function destroyOutline(Event $event, EventOutlineItem $eventOutlineItem)
    {
        if ((int) $eventOutlineItem->event_id !== (int) $event->id) {
            return response()->json(['message' => 'Outline item tidak valid untuk event ini'], 422);
        }

        $deletedOrder = $eventOutlineItem->order;
        $eventOutlineItem->delete();

        $event->eventOutlineItems()
            ->where('order', '>', $deletedOrder)
            ->decrement('order');

        return response()->json(['message' => 'Outline event berhasil dihapus']);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }

    public function calendar(Request $request)
    {
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $events = Event::with(['client', 'order'])
            ->whereYear('event_date', $year)
            ->whereMonth('event_date', $month)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'source' => 'order',
                    'title' => $event->event_name,
                    'start' => $event->event_date->format('Y-m-d'),
                    'type' => $event->event_type,
                    'status' => $event->status,
                    'client' => $event->client->name,
                    'note' => $event->calendar_note ?: $event->notes,
                    'venue' => $event->venue_name,
                    'start_time' => $event->start_time?->format('H:i'),
                    'end_time' => $event->end_time?->format('H:i'),
                    'event_code' => $event->event_code,
                ];
            });

        $miniOrders = MiniOrder::with(['vendorClient'])
            ->whereYear('event_date', $year)
            ->whereMonth('event_date', $month)
            ->get()
            ->map(function (MiniOrder $order) {
                $status = $this->mapMiniStatusToEventStatus($order->status);
                return [
                    'id' => $order->id,
                    'source' => 'mini',
                    'title' => $order->event_name,
                    'start' => $order->event_date?->format('Y-m-d') ?? '',
                    'type' => 'other',
                    'status' => $status,
                    'client' => $order->vendorClient?->name ?? '-',
                    'note' => $order->notes,
                    'venue' => $order->event_location,
                    'start_time' => null,
                    'end_time' => null,
                    'event_code' => $order->order_number,
                    'mini_order_id' => $order->id,
                ];
            });

        return response()->json($events->concat($miniOrders)->values());
    }

    private function mapMiniStatusToEventStatus(?string $status): string
    {
        return match ($status) {
            'pending_confirmation', 'negotiation' => 'planning',
            'confirmed', 'paid', 'dp_paid' => 'confirmed',
            'processing' => 'preparation',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            default => 'planning',
        };
    }

    private function mapEventStatusLabel(string $status): string
    {
        return match ($status) {
            'planning' => 'Perencanaan',
            'confirmed' => 'Terkonfirmasi',
            'preparation' => 'Persiapan',
            'ongoing' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => $status,
        };
    }

    private function mapEventStatusToMiniStatuses(string $status): array
    {
        return match ($status) {
            'planning' => ['pending_confirmation', 'negotiation'],
            'confirmed' => ['confirmed', 'paid', 'dp_paid'],
            'preparation' => ['processing'],
            'completed' => ['completed'],
            'cancelled' => ['cancelled'],
            default => ['pending_confirmation', 'negotiation', 'confirmed', 'paid', 'dp_paid', 'processing', 'completed', 'cancelled'],
        };
    }
}
