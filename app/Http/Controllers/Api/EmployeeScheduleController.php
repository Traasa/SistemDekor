<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EmployeeScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeSchedule::with('employee');

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

        $schedules = $query->orderBy('date', 'asc')
            ->orderBy('shift_start', 'asc')
            ->get();

        return response()->json(['data' => $schedules]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'shift_start' => 'required|date_format:H:i',
            'shift_end' => 'required|date_format:H:i|after:shift_start',
            'shift_type' => 'required|in:morning,afternoon,evening,night,full_day',
            'status' => 'in:scheduled,confirmed,cancelled,completed',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'scheduled';

        // Check for conflicts
        $schedule = new EmployeeSchedule($data);
        if ($schedule->hasConflict($data['employee_id'], $data['date'], $data['shift_start'], $data['shift_end'])) {
            return response()->json([
                'message' => 'Jadwal bentrok dengan jadwal yang sudah ada'
            ], 422);
        }

        $schedule = EmployeeSchedule::create($data);

        return response()->json(['data' => $schedule->load('employee')], 201);
    }

    public function update(Request $request, $id)
    {
        $schedule = EmployeeSchedule::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'shift_start' => 'required|date_format:H:i',
            'shift_end' => 'required|date_format:H:i|after:shift_start',
            'shift_type' => 'required|in:morning,afternoon,evening,night,full_day',
            'status' => 'required|in:scheduled,confirmed,cancelled,completed',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Check for conflicts (excluding current schedule)
        if ($schedule->hasConflict($data['employee_id'], $data['date'], $data['shift_start'], $data['shift_end'], $id)) {
            return response()->json([
                'message' => 'Jadwal bentrok dengan jadwal yang sudah ada'
            ], 422);
        }

        $schedule->update($data);

        return response()->json(['data' => $schedule->load('employee')]);
    }

    public function destroy($id)
    {
        $schedule = EmployeeSchedule::findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus']);
    }

    /**
     * Get calendar view for a specific month
     */
    public function calendar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'employee_id' => 'nullable|exists:employees,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $year = $request->year;
        $month = $request->month;
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $query = EmployeeSchedule::with('employee')
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $schedules = $query->orderBy('date')->get();

        return response()->json(['data' => $schedules]);
    }

    /**
     * Bulk create schedules
     */
    public function bulkStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'shift_start' => 'required|date_format:H:i',
            'shift_end' => 'required|date_format:H:i|after:shift_start',
            'shift_type' => 'required|in:morning,afternoon,evening,night,full_day',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'days' => 'required|array', // Array of day numbers (0=Sunday, 6=Saturday)
            'days.*' => 'integer|min:0|max:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $created = [];

        while ($startDate->lte($endDate)) {
            // Check if this day is in the selected days
            if (in_array($startDate->dayOfWeek, $request->days)) {
                // Check for conflicts
                $schedule = new EmployeeSchedule();
                if (!$schedule->hasConflict(
                    $request->employee_id,
                    $startDate->format('Y-m-d'),
                    $request->shift_start,
                    $request->shift_end
                )) {
                    $created[] = EmployeeSchedule::create([
                        'employee_id' => $request->employee_id,
                        'date' => $startDate->format('Y-m-d'),
                        'shift_start' => $request->shift_start,
                        'shift_end' => $request->shift_end,
                        'shift_type' => $request->shift_type,
                        'status' => 'scheduled',
                        'location' => $request->location,
                        'notes' => $request->notes
                    ]);
                }
            }

            $startDate->addDay();
        }

        return response()->json([
            'message' => count($created) . ' jadwal berhasil dibuat',
            'data' => $created
        ], 201);
    }
}
