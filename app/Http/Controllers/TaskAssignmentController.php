<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\InventoryItem;
use App\Models\TaskAssignment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TaskAssignmentController extends Controller
{
    public function index(Request $request, Event $event)
    {
        $tasks = $event->taskAssignments()
            ->with(['user', 'rundownItem'])
            ->orderBy('deadline')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'rundown_item_id' => 'nullable|exists:rundown_items,id',
            'user_id' => 'required|exists:users,id',
            'task_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'nullable|in:assigned,in_progress,completed,cancelled',
            'resource_requirements' => 'nullable|array',
            'resource_requirements.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'resource_requirements.*.requirement_type' => 'required|in:equipment,catering,additional',
            'resource_requirements.*.quantity' => 'required|integer|min:1',
            'resource_requirements.*.notes' => 'nullable|string',
        ]);

        $validated['resource_requirements'] = $this->normalizeResourceRequirements($validated['resource_requirements'] ?? []);

        $validated['event_id'] = $event->id;
        $validated['status'] = $validated['status'] ?? 'assigned';

        $task = TaskAssignment::create($validated);

        return response()->json($task->load(['user', 'rundownItem']), 201);
    }

    public function update(Request $request, Event $event, TaskAssignment $taskAssignment)
    {
        $validated = $request->validate([
            'task_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:assigned,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
            'resource_requirements' => 'nullable|array',
            'resource_requirements.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'resource_requirements.*.requirement_type' => 'required|in:equipment,catering,additional',
            'resource_requirements.*.quantity' => 'required|integer|min:1',
            'resource_requirements.*.notes' => 'nullable|string',
        ]);

        if (array_key_exists('resource_requirements', $validated)) {
            $validated['resource_requirements'] = $this->normalizeResourceRequirements($validated['resource_requirements'] ?? []);
        }

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_at'] = now();
        }

        $taskAssignment->update($validated);

        return response()->json($taskAssignment->load(['user', 'rundownItem']));
    }

    private function normalizeResourceRequirements(array $requirements): array
    {
        $normalized = [];

        foreach ($requirements as $requirement) {
            $item = InventoryItem::query()->find($requirement['inventory_item_id']);

            if (!$item) {
                continue;
            }

            if ((int) $item->quantity < (int) $requirement['quantity']) {
                throw ValidationException::withMessages([
                    'resource_requirements' => ['Stok item "' . $item->name . '" tidak mencukupi untuk tugas ini.'],
                ]);
            }

            $normalized[] = [
                'inventory_item_id' => (int) $item->id,
                'item_name' => $item->name,
                'item_unit' => $item->unit,
                'category_name' => $item->category?->name,
                'category_group' => $item->category?->category_group ?: 'lainnya',
                'requirement_type' => $requirement['requirement_type'],
                'quantity' => (int) $requirement['quantity'],
                'notes' => $requirement['notes'] ?? null,
            ];
        }

        return $normalized;
    }

    public function destroy(Event $event, TaskAssignment $taskAssignment)
    {
        $taskAssignment->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function myTasks(Request $request)
    {
        $user = $request->user();
        
        $tasks = TaskAssignment::with(['event', 'rundownItem'])
            ->where('user_id', $user->id)
            ->where('status', '!=', 'completed')
            ->orderBy('deadline')
            ->get();

        return response()->json($tasks);
    }
}
