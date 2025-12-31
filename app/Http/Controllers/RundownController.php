<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\RundownItem;
use Illuminate\Http\Request;

class RundownController extends Controller
{
    public function index(Request $request, Event $event)
    {
        $rundownItems = $event->rundownItems()
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $rundownItems]);
    }

    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'time' => 'required',
            'duration' => 'required|integer|min:1',
            'activity' => 'required|string|max:255',
            'description' => 'nullable|string',
            'pic' => 'nullable|string',
            'notes' => 'nullable|string',
            'equipment_needed' => 'nullable|array',
            'is_critical' => 'boolean',
        ]);

        // Get next order number
        $maxOrder = $event->rundownItems()->max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;
        $validated['event_id'] = $event->id;

        $rundownItem = RundownItem::create($validated);

        return response()->json($rundownItem, 201);
    }

    public function update(Request $request, Event $event, RundownItem $rundownItem)
    {
        $validated = $request->validate([
            'time' => 'sometimes',
            'duration' => 'sometimes|integer|min:1',
            'activity' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'pic' => 'nullable|string',
            'notes' => 'nullable|string',
            'equipment_needed' => 'nullable|array',
            'is_critical' => 'boolean',
            'status' => 'sometimes|in:pending,in_progress,completed,skipped',
        ]);

        $rundownItem->update($validated);

        return response()->json($rundownItem);
    }

    public function destroy(Event $event, RundownItem $rundownItem)
    {
        $rundownItem->delete();
        
        // Reorder remaining items
        $event->rundownItems()
            ->where('order', '>', $rundownItem->order)
            ->decrement('order');

        return response()->json(['message' => 'Rundown item deleted successfully']);
    }

    public function reorder(Request $request, Event $event)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:rundown_items,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            RundownItem::where('id', $item['id'])
                ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Rundown reordered successfully']);
    }
}
