<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EmployeeAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeAttendance::with(['employee', 'approver']);

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by month
        if ($request->has('year') && $request->has('month')) {
            $query->forMonth($request->year, $request->month);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        return response()->json(['data' => $attendances]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,late,absent,on_leave,sick,half_day',
            'leave_type' => 'nullable|in:sick,annual,unpaid,emergency,other',
            'notes' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Check if attendance already exists for this date
        $existing = EmployeeAttendance::where('employee_id', $data['employee_id'])
            ->where('date', $data['date'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Absensi untuk tanggal ini sudah ada'
            ], 422);
        }

        $attendance = EmployeeAttendance::create($data);

        return response()->json(['data' => $attendance->load(['employee', 'approver'])], 201);
    }

    public function update(Request $request, $id)
    {
        $attendance = EmployeeAttendance::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'status' => 'required|in:present,late,absent,on_leave,sick,half_day',
            'leave_type' => 'nullable|in:sick,annual,unpaid,emergency,other',
            'notes' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attendance->update($validator->validated());

        return response()->json(['data' => $attendance->load(['employee', 'approver'])]);
    }

    public function destroy($id)
    {
        $attendance = EmployeeAttendance::findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Absensi berhasil dihapus']);
    }

    /**
     * Check in
     */
    public function checkIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $today = now()->format('Y-m-d');
        $now = now()->format('H:i');

        // Check if already checked in
        $attendance = EmployeeAttendance::where('employee_id', $request->employee_id)
            ->where('date', $today)
            ->first();

        if ($attendance && $attendance->check_in) {
            return response()->json([
                'message' => 'Sudah check-in hari ini'
            ], 422);
        }

        // Determine status (late if after 9 AM)
        $status = Carbon::parse($now)->gte(Carbon::parse('09:00')) ? 'late' : 'present';

        if ($attendance) {
            $attendance->update([
                'check_in' => $now,
                'status' => $status,
                'location' => $request->location,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude
            ]);
        } else {
            $attendance = EmployeeAttendance::create([
                'employee_id' => $request->employee_id,
                'date' => $today,
                'check_in' => $now,
                'status' => $status,
                'location' => $request->location,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude
            ]);
        }

        return response()->json(['data' => $attendance->load('employee')]);
    }

    /**
     * Check out
     */
    public function checkOut(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $today = now()->format('Y-m-d');
        $now = now()->format('H:i');

        $attendance = EmployeeAttendance::where('employee_id', $request->employee_id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json([
                'message' => 'Belum check-in hari ini'
            ], 422);
        }

        if ($attendance->check_out) {
            return response()->json([
                'message' => 'Sudah check-out hari ini'
            ], 422);
        }

        $attendance->update(['check_out' => $now]);

        return response()->json(['data' => $attendance->load('employee')]);
    }

    /**
     * Approve leave request
     */
    public function approve(Request $request, $id)
    {
        $attendance = EmployeeAttendance::findOrFail($id);

        if ($attendance->approved_by) {
            return response()->json([
                'message' => 'Sudah disetujui sebelumnya'
            ], 422);
        }

        $attendance->update([
            'approved_by' => auth()->id(),
            'approved_at' => now()
        ]);

        return response()->json(['data' => $attendance->load(['employee', 'approver'])]);
    }

    /**
     * Get attendance summary for a month
     */
    public function summary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attendances = EmployeeAttendance::where('employee_id', $request->employee_id)
            ->forMonth($request->year, $request->month)
            ->get();

        $summary = [
            'total_days' => $attendances->count(),
            'present' => $attendances->where('status', 'present')->count(),
            'late' => $attendances->where('status', 'late')->count(),
            'absent' => $attendances->where('status', 'absent')->count(),
            'on_leave' => $attendances->where('status', 'on_leave')->count(),
            'sick' => $attendances->where('status', 'sick')->count(),
            'half_day' => $attendances->where('status', 'half_day')->count(),
            'total_hours' => $attendances->sum('work_hours')
        ];

        return response()->json([
            'data' => $attendances,
            'summary' => $summary
        ]);
    }

    /**
     * Get pending approvals
     */
    public function pendingApprovals()
    {
        $attendances = EmployeeAttendance::with('employee')
            ->pendingApproval()
            ->orderBy('date', 'desc')
            ->get();

        return response()->json(['data' => $attendances]);
    }
}
