<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Display a listing of reports
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::query();

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('date_from', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('date_to', '<=', $request->date_to);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Store a newly created report
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'data' => 'nullable|array',
            'summary' => 'nullable|string',
        ]);

        $report = Report::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Report created successfully',
            'data' => $report
        ], 201);
    }

    /**
     * Display the specified report
     */
    public function show(Report $report): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Update the specified report
     */
    public function update(Request $request, Report $report): JsonResponse
    {
        $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'date_from' => 'sometimes|required|date',
            'date_to' => 'sometimes|required|date|after_or_equal:date_from',
            'data' => 'nullable|array',
            'summary' => 'nullable|string',
        ]);

        $report->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully',
            'data' => $report
        ]);
    }

    /**
     * Remove the specified report
     */
    public function destroy(Report $report): JsonResponse
    {
        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully'
        ]);
    }

    /**
     * Generate transaction report
     */
    public function generateTransactionReport(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $data = Report::generateTransactionReport(
            $request->date_from,
            $request->date_to
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Generate service report
     */
    public function generateServiceReport(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $data = Report::generateServiceReport(
            $request->date_from,
            $request->date_to
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Generate revenue report
     */
    public function generateRevenueReport(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $data = Report::generateRevenueReport(
            $request->date_from,
            $request->date_to
        );

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
