<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\RundownItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['client', 'order'])
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

        $events = $query->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'client_id' => 'required|exists:clients,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|in:wedding,birthday,corporate,engagement,anniversary,graduation,other',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'venue_name' => 'required|string|max:255',
            'venue_address' => 'required|string',
            'guest_count' => 'nullable|integer',
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'contact_persons' => 'nullable|array',
        ]);

        $event = Event::create($validated);

        // Generate default rundown template based on event type
        $this->generateDefaultRundown($event);

        return response()->json($event->load(['client', 'order', 'rundownItems']), 201);
    }

    public function show(Event $event)
    {
        return response()->json($event->load([
            'client',
            'order.orderDetails.service',
            'rundownItems',
            'taskAssignments.user'
        ]));
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'event_name' => 'sometimes|string|max:255',
            'event_type' => 'sometimes|in:wedding,birthday,corporate,engagement,anniversary,graduation,other',
            'event_date' => 'sometimes|date',
            'start_time' => 'sometimes',
            'end_time' => 'sometimes',
            'venue_name' => 'sometimes|string|max:255',
            'venue_address' => 'sometimes|string',
            'guest_count' => 'nullable|integer',
            'status' => 'sometimes|in:planning,confirmed,preparation,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'contact_persons' => 'nullable|array',
        ]);

        $event->update($validated);

        return response()->json($event->load(['client', 'order']));
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }

    private function generateDefaultRundown(Event $event)
    {
        $templates = [
            'wedding' => [
                ['time' => '06:00', 'duration' => 180, 'activity' => 'Persiapan & Setup Dekorasi', 'is_critical' => true],
                ['time' => '09:00', 'duration' => 60, 'activity' => 'Final Check & Briefing Tim'],
                ['time' => '10:00', 'duration' => 30, 'activity' => 'Kedatangan Tamu Undangan'],
                ['time' => '10:30', 'duration' => 30, 'activity' => 'Akad Nikah'],
                ['time' => '11:00', 'duration' => 30, 'activity' => 'Sesi Foto Keluarga'],
                ['time' => '11:30', 'duration' => 90, 'activity' => 'Resepsi & Makan Siang'],
                ['time' => '13:00', 'duration' => 60, 'activity' => 'Sesi Foto Pengantin dengan Tamu'],
                ['time' => '14:00', 'duration' => 30, 'activity' => 'Penutupan Acara'],
                ['time' => '14:30', 'duration' => 120, 'activity' => 'Bongkar & Cleanup'],
            ],
            'birthday' => [
                ['time' => '14:00', 'duration' => 120, 'activity' => 'Persiapan & Setup Dekorasi', 'is_critical' => true],
                ['time' => '16:00', 'duration' => 30, 'activity' => 'Final Check'],
                ['time' => '16:30', 'duration' => 30, 'activity' => 'Kedatangan Tamu'],
                ['time' => '17:00', 'duration' => 60, 'activity' => 'Games & Hiburan'],
                ['time' => '18:00', 'duration' => 30, 'activity' => 'Potong Kue & Foto'],
                ['time' => '18:30', 'duration' => 60, 'activity' => 'Makan & Bincang-bincang'],
                ['time' => '19:30', 'duration' => 30, 'activity' => 'Penutupan'],
                ['time' => '20:00', 'duration' => 90, 'activity' => 'Bongkar & Cleanup'],
            ],
            'corporate' => [
                ['time' => '06:00', 'duration' => 120, 'activity' => 'Setup & Persiapan Venue', 'is_critical' => true],
                ['time' => '08:00', 'duration' => 30, 'activity' => 'Registration & Welcome Coffee'],
                ['time' => '08:30', 'duration' => 30, 'activity' => 'Opening Ceremony'],
                ['time' => '09:00', 'duration' => 120, 'activity' => 'Main Session'],
                ['time' => '11:00', 'duration' => 30, 'activity' => 'Coffee Break'],
                ['time' => '11:30', 'duration' => 90, 'activity' => 'Sesi Lanjutan'],
                ['time' => '13:00', 'duration' => 60, 'activity' => 'Lunch Break'],
                ['time' => '14:00', 'duration' => 120, 'activity' => 'Afternoon Session'],
                ['time' => '16:00', 'duration' => 30, 'activity' => 'Closing & Networking'],
                ['time' => '16:30', 'duration' => 90, 'activity' => 'Cleanup'],
            ],
        ];

        $template = $templates[$event->event_type] ?? $templates['birthday'];
        
        foreach ($template as $index => $item) {
            RundownItem::create([
                'event_id' => $event->id,
                'order' => $index + 1,
                'time' => $item['time'],
                'duration' => $item['duration'],
                'activity' => $item['activity'],
                'is_critical' => $item['is_critical'] ?? false,
                'status' => 'pending',
            ]);
        }
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
                    'title' => $event->event_name,
                    'start' => $event->event_date->format('Y-m-d'),
                    'type' => $event->event_type,
                    'status' => $event->status,
                    'client' => $event->client->name,
                ];
            });

        return response()->json($events);
    }
}
