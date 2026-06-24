<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeePayroll;
use App\Models\OperationalCost;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeePayrollController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmployeePayroll::query()->with(['employee']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->integer('employee_id'));
        }

        if ($request->filled('period_type')) {
            $query->where('period_type', $request->string('period_type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('period_start', '>=', $request->string('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('period_end', '<=', $request->string('date_to'));
        }

        $rows = $query->latest('id')->get();

        return response()->json(['data' => $rows]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'base_amount' => 'required|numeric|min:0',
            'bonuses' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'adjustments' => 'nullable|numeric',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:pending,paid,cancelled',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::query()->findOrFail($validated['employee_id']);
        $periodType = $this->resolvePeriodTypeByEmployment($employee->employment_type);
        $this->validatePeriodByType($periodType, $validated['period_start'], $validated['period_end']);

        $bonuses = (float) ($validated['bonuses'] ?? 0);
        $deductions = (float) ($validated['deductions'] ?? 0);
        $adjustments = (float) ($validated['adjustments'] ?? 0);
        $baseAmount = (float) $validated['base_amount'];
        $totalAmount = $baseAmount + $bonuses + $adjustments - $deductions;
        $status = $validated['status'] ?? 'pending';

        $payroll = EmployeePayroll::create([
            'employee_id' => $validated['employee_id'],
            'payroll_code' => EmployeePayroll::generateCode(),
            'period_type' => $periodType,
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'base_amount' => $baseAmount,
            'bonuses' => $bonuses,
            'deductions' => $deductions,
            'adjustments' => $adjustments,
            'total_amount' => $totalAmount,
            'payment_date' => $validated['payment_date'] ?? null,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        // Auto-create operational cost when status is paid
        if ($status === 'paid') {
            $this->createOperationalCost($payroll, $employee);
        }

        return response()->json(['data' => $payroll->load('employee')], 201);
    }

    public function update(Request $request, EmployeePayroll $employeePayroll): JsonResponse
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'base_amount' => 'required|numeric|min:0',
            'bonuses' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'adjustments' => 'nullable|numeric',
            'payment_date' => 'nullable|date',
            'status' => 'nullable|in:pending,paid,cancelled',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $employeePayroll->status;
        $periodType = $this->resolvePeriodTypeByEmployment($employeePayroll->employee->employment_type);
        $this->validatePeriodByType($periodType, $validated['period_start'], $validated['period_end']);

        $bonuses = (float) ($validated['bonuses'] ?? 0);
        $deductions = (float) ($validated['deductions'] ?? 0);
        $adjustments = (float) ($validated['adjustments'] ?? 0);
        $baseAmount = (float) $validated['base_amount'];
        $totalAmount = $baseAmount + $bonuses + $adjustments - $deductions;
        $newStatus = $validated['status'] ?? $employeePayroll->status;

        $employeePayroll->update([
            'period_type' => $periodType,
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'base_amount' => $baseAmount,
            'bonuses' => $bonuses,
            'deductions' => $deductions,
            'adjustments' => $adjustments,
            'total_amount' => $totalAmount,
            'payment_date' => $validated['payment_date'] ?? null,
            'status' => $newStatus,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Sync operational cost based on status change
        $this->syncOperationalCost($employeePayroll, $oldStatus, $newStatus);

        return response()->json(['data' => $employeePayroll->fresh('employee')]);
    }

    public function destroy(EmployeePayroll $employeePayroll): JsonResponse
    {
        // Remove related operational cost
        $this->deleteOperationalCost($employeePayroll->id);

        $employeePayroll->delete();

        return response()->json(['message' => 'Payroll berhasil dihapus']);
    }

    private function resolvePeriodTypeByEmployment(string $employmentType): string
    {
        if ($employmentType === 'full_time') {
            return 'monthly';
        }

        if (in_array($employmentType, ['part_time', 'freelance'], true)) {
            return 'weekly';
        }

        return 'weekly';
    }

    private function validatePeriodByType(string $periodType, string $periodStart, string $periodEnd): void
    {
        $start = Carbon::parse($periodStart);
        $end = Carbon::parse($periodEnd);

        if ($periodType === 'monthly') {
            if (!$start->copy()->isSameDay($start->copy()->startOfMonth()) || !$end->copy()->isSameDay($end->copy()->endOfMonth()) || !$start->isSameMonth($end)) {
                abort(422, 'Payroll bulanan wajib menggunakan awal dan akhir bulan yang sama.');
            }
            return;
        }

        if ($periodType === 'weekly') {
            if ($start->copy()->addDays(6)->toDateString() !== $end->toDateString()) {
                abort(422, 'Payroll mingguan wajib 7 hari (period_end = period_start + 6 hari).');
            }
        }
    }

    /**
     * Create an operational cost entry for a paid payroll.
     */
    private function createOperationalCost(EmployeePayroll $payroll, Employee $employee): void
    {
        $periodLabel = Carbon::parse($payroll->period_start)->format('d/m/Y') . ' - ' . Carbon::parse($payroll->period_end)->format('d/m/Y');

        OperationalCost::create([
            'cost_code' => OperationalCost::generateCode(),
            'cost_type' => 'payroll',
            'title' => 'Gaji ' . $employee->name . ' (' . $payroll->payroll_code . ')',
            'description' => 'Payroll ' . $payroll->period_type . ' periode ' . $periodLabel,
            'amount' => $payroll->total_amount,
            'cost_date' => $payroll->payment_date ?? now()->toDateString(),
            'reference_type' => 'employee_payroll',
            'reference_id' => $payroll->id,
            'notes' => $payroll->notes,
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Sync operational cost based on payroll status change.
     */
    private function syncOperationalCost(EmployeePayroll $payroll, string $oldStatus, string $newStatus): void
    {
        $existingCost = OperationalCost::where('reference_type', 'employee_payroll')
            ->where('reference_id', $payroll->id)
            ->first();

        if ($oldStatus !== 'paid' && $newStatus === 'paid') {
            // Was not paid, now paid -> create operational cost
            if (!$existingCost) {
                $this->createOperationalCost($payroll, $payroll->employee);
            }
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            // Was paid, now not paid -> delete operational cost
            if ($existingCost) {
                $existingCost->delete();
            }
        } elseif ($oldStatus === 'paid' && $newStatus === 'paid' && $existingCost) {
            // Still paid but amount may have changed -> update
            $periodLabel = Carbon::parse($payroll->period_start)->format('d/m/Y') . ' - ' . Carbon::parse($payroll->period_end)->format('d/m/Y');
            $existingCost->update([
                'title' => 'Gaji ' . $payroll->employee->name . ' (' . $payroll->payroll_code . ')',
                'description' => 'Payroll ' . $payroll->period_type . ' periode ' . $periodLabel,
                'amount' => $payroll->total_amount,
                'cost_date' => $payroll->payment_date ?? now()->toDateString(),
                'notes' => $payroll->notes,
            ]);
        }
    }

    /**
     * Delete operational cost linked to a payroll.
     */
    private function deleteOperationalCost(int $payrollId): void
    {
        OperationalCost::where('reference_type', 'employee_payroll')
            ->where('reference_id', $payrollId)
            ->delete();
    }
}
