<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeAssignment::with(['employee', 'order']);

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('assignment_date', [$request->start_date, $request->end_date]);
        }

        $assignments = $query->orderBy('assignment_date', 'desc')->get();

        return response()->json(['data' => $assignments]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'order_id' => 'required|exists:orders,id',
            'role' => 'required|string|max:50',
            'assignment_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'status' => 'in:assigned,confirmed,in_progress,completed,cancelled',
            'fee' => 'nullable|numeric|min:0',
            'tasks' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'assigned';

        $assignment = EmployeeAssignment::create($data);

        return response()->json(['data' => $assignment->load(['employee', 'order'])], 201);
    }

    public function update(Request $request, $id)
    {
        $assignment = EmployeeAssignment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'order_id' => 'required|exists:orders,id',
            'role' => 'required|string|max:50',
            'assignment_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'status' => 'required|in:assigned,confirmed,in_progress,completed,cancelled',
            'fee' => 'nullable|numeric|min:0',
            'tasks' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $assignment->update($validator->validated());

        return response()->json(['data' => $assignment->load(['employee', 'order'])]);
    }

    public function destroy($id)
    {
        $assignment = EmployeeAssignment::findOrFail($id);

        // Only allow deletion if not completed
        if ($assignment->status === 'completed') {
            return response()->json([
                'message' => 'Tidak dapat menghapus penugasan yang sudah selesai'
            ], 422);
        }

        $assignment->delete();

        return response()->json(['message' => 'Penugasan berhasil dihapus']);
    }

    /**
     * Get assignments by order
     */
    public function byOrder($orderId)
    {
        $assignments = EmployeeAssignment::with('employee')
            ->where('order_id', $orderId)
            ->orderBy('assignment_date')
            ->get();

        return response()->json(['data' => $assignments]);
    }

    /**
     * Get upcoming assignments
     */
    public function upcoming(Request $request)
    {
        $query = EmployeeAssignment::with(['employee', 'order'])
            ->upcoming();

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $assignments = $query->orderBy('assignment_date')->get();

        return response()->json(['data' => $assignments]);
    }
}
