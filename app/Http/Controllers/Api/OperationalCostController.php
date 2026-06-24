<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OperationalCost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OperationalCostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OperationalCost::query();

        if ($request->filled('cost_type')) {
            $query->where('cost_type', $request->string('cost_type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('cost_date', '>=', $request->string('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('cost_date', '<=', $request->string('date_to'));
        }

        $rows = $query->latest('cost_date')->latest('id')->get();

        return response()->json(['data' => $rows]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cost_type' => 'required|in:production,catering_raw_material,other,payroll',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'cost_date' => 'required|date',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        $cost = OperationalCost::create([
            ...$validated,
            'cost_code' => OperationalCost::generateCode(),
            'created_by' => auth()->id(),
        ]);

        return response()->json(['data' => $cost], 201);
    }

    public function update(Request $request, OperationalCost $operationalCost): JsonResponse
    {
        // Prevent direct editing of payroll-managed entries
        if ($operationalCost->cost_type === 'payroll' && $operationalCost->reference_type === 'employee_payroll') {
            return response()->json([
                'message' => 'Biaya payroll dikelola otomatis melalui menu Payroll Karyawan. Silakan edit di halaman Payroll.'
            ], 422);
        }

        $validated = $request->validate([
            'cost_type' => 'required|in:production,catering_raw_material,other,payroll',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'cost_date' => 'required|date',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
        ]);

        $operationalCost->update($validated);

        return response()->json(['data' => $operationalCost]);
    }

    public function destroy(OperationalCost $operationalCost): JsonResponse
    {
        // Prevent direct deletion of payroll-managed entries
        if ($operationalCost->cost_type === 'payroll' && $operationalCost->reference_type === 'employee_payroll') {
            return response()->json([
                'message' => 'Biaya payroll dikelola otomatis melalui menu Payroll Karyawan. Hapus dari halaman Payroll.'
            ], 422);
        }

        $operationalCost->delete();

        return response()->json(['message' => 'Biaya operasional berhasil dihapus']);
    }
}
