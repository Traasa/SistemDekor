<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query()->with(['schedules', 'assignments', 'attendances']);

        // Filter by position
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by employment type
        if ($request->has('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $employees = $query->withCount([
            'schedules' => function ($q) {
                $q->where('date', '>=', now()->toDateString());
            },
            'assignments' => function ($q) {
                $q->whereIn('status', ['assigned', 'confirmed', 'in_progress']);
            }
        ])->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $employees]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'required|string|max:20',
            'position' => 'required|in:event_coordinator,decorator,photographer,videographer,mc,sound_technician,lighting_technician,caterer,driver,admin,manager,other',
            'department' => 'nullable|string|max:50',
            'join_date' => 'required|date',
            'employment_type' => 'required|in:full_time,part_time,freelance,intern',
            'status' => 'in:active,inactive,on_leave,terminated',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'salary' => 'nullable|numeric|min:0',
            'skills' => 'nullable|array',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['employee_code'] = Employee::generateCode();
        $data['status'] = $data['status'] ?? 'active';

        $employee = Employee::create($data);

        return response()->json(['data' => $employee], 201);
    }

    public function show($id)
    {
        $employee = Employee::with([
            'schedules' => function ($q) {
                $q->where('date', '>=', now()->toDateString())
                    ->orderBy('date', 'asc')
                    ->limit(10);
            },
            'assignments' => function ($q) {
                $q->with('order')
                    ->whereIn('status', ['assigned', 'confirmed', 'in_progress'])
                    ->orderBy('assignment_date', 'asc')
                    ->limit(10);
            },
            'attendances' => function ($q) {
                $q->orderBy('date', 'desc')
                    ->limit(30);
            }
        ])->findOrFail($id);

        return response()->json(['data' => $employee]);
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email,' . $id,
            'phone' => 'required|string|max:20',
            'position' => 'required|in:event_coordinator,decorator,photographer,videographer,mc,sound_technician,lighting_technician,caterer,driver,admin,manager,other',
            'department' => 'nullable|string|max:50',
            'join_date' => 'required|date',
            'employment_type' => 'required|in:full_time,part_time,freelance,intern',
            'status' => 'required|in:active,inactive,on_leave,terminated',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:50',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'salary' => 'nullable|numeric|min:0',
            'skills' => 'nullable|array',
            'notes' => 'nullable|string',
            'photo' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee->update($validator->validated());

        return response()->json(['data' => $employee]);
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);

        // Check if employee has active assignments
        $hasActiveAssignments = $employee->assignments()
            ->whereIn('status', ['assigned', 'confirmed', 'in_progress'])
            ->exists();

        if ($hasActiveAssignments) {
            return response()->json([
                'message' => 'Tidak dapat menghapus karyawan yang memiliki penugasan aktif'
            ], 422);
        }

        $employee->delete();

        return response()->json(['message' => 'Karyawan berhasil dihapus']);
    }

    /**
     * Check employee availability
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee = Employee::findOrFail($request->employee_id);
        $available = $employee->isAvailableOn($request->date);

        $response = ['available' => $available];

        if (!$available) {
            // Get reason
            $schedule = $employee->schedules()
                ->where('date', $request->date)
                ->first();

            $assignment = $employee->assignments()
                ->where('assignment_date', $request->date)
                ->with('order')
                ->first();

            $attendance = $employee->attendances()
                ->where('date', $request->date)
                ->first();

            if ($schedule) {
                $response['reason'] = 'Sudah ada jadwal kerja';
                $response['schedule'] = $schedule;
            } elseif ($assignment) {
                $response['reason'] = 'Sudah ada penugasan';
                $response['assignment'] = $assignment;
            } elseif ($attendance && in_array($attendance->status, ['on_leave', 'sick'])) {
                $response['reason'] = 'Sedang cuti/sakit';
                $response['attendance'] = $attendance;
            } elseif ($employee->status !== 'active') {
                $response['reason'] = 'Karyawan tidak aktif';
            }
        }

        return response()->json($response);
    }
}
