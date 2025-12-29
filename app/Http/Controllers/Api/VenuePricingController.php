<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VenuePricing;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class VenuePricingController extends Controller
{
    /**
     * Get all pricing for a venue
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = VenuePricing::with('venue');

            if ($request->has('venue_id')) {
                $query->where('venue_id', $request->venue_id);
            }

            if ($request->has('day_type')) {
                $query->where('day_type', $request->day_type);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            $pricing = $query->get();

            return response()->json([
                'success' => true,
                'data' => $pricing
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pricing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new venue pricing
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'venue_id' => 'required|exists:venues,id',
            'day_type' => 'required|in:weekday,weekend,holiday',
            'session_type' => 'required|in:full_day,morning,afternoon,evening',
            'base_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pricing = VenuePricing::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Pricing created successfully',
                'data' => $pricing->load('venue')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create pricing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update venue pricing
     */
    public function update(Request $request, VenuePricing $venuePricing): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'day_type' => 'required|in:weekday,weekend,holiday',
            'session_type' => 'required|in:full_day,morning,afternoon,evening',
            'base_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $venuePricing->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Pricing updated successfully',
                'data' => $venuePricing->load('venue')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update pricing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete venue pricing
     */
    public function destroy(VenuePricing $venuePricing): JsonResponse
    {
        try {
            $venuePricing->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pricing deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete pricing: ' . $e->getMessage()
            ], 500);
        }
    }
}
