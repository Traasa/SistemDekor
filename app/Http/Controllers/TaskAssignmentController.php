<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\TaskAssignment;
use App\Models\User;
use Illuminate\Http\Request;

class TaskAssignmentController extends Controller
{
    public function index(Request $request, Event $event)
    {
        $tasks = $event->taskAssignments()
            ->with(['user', 'rundownItem'])
            ->orderBy('deadline')
            ->get();

        return response()->json($tasks);
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
        ]);

        $validated['event_id'] = $event->id;
        $validated['status'] = 'assigned';

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
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_at'] = now();
        }

        $taskAssignment->update($validated);

        return response()->json($taskAssignment->load(['user', 'rundownItem']));
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
