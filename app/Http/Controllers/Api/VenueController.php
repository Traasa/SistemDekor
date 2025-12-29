<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class VenueController extends Controller
{
    /**
     * Display a listing of venues
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Venue::withCount('bookings');

            // Filter by city
            if ($request->has('city')) {
                $query->where('city', $request->city);
            }

            // Filter by venue type
            if ($request->has('venue_type')) {
                $query->where('venue_type', $request->venue_type);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->is_active);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
                });
            }

            $venues = $query->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $venues
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve venues: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created venue
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'venue_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate unique code
            $code = 'VEN-' . strtoupper(Str::random(6));
            while (Venue::where('code', $code)->exists()) {
                $code = 'VEN-' . strtoupper(Str::random(6));
            }

            $venue = Venue::create(array_merge($request->all(), ['code' => $code]));

            return response()->json([
                'success' => true,
                'message' => 'Venue created successfully',
                'data' => $venue
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create venue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified venue
     */
    public function show(Venue $venue): JsonResponse
    {
        try {
            $venue->load(['pricing', 'bookings' => function ($query) {
                $query->latest()->limit(10);
            }]);

            return response()->json([
                'success' => true,
                'data' => $venue
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve venue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified venue
     */
    public function update(Request $request, Venue $venue): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'venue_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $venue->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Venue updated successfully',
                'data' => $venue
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update venue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified venue
     */
    public function destroy(Venue $venue): JsonResponse
    {
        try {
            // Check if venue has active bookings
            $hasActiveBookings = $venue->bookings()
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($hasActiveBookings) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete venue with active bookings'
                ], 422);
            }

            $venue->delete();

            return response()->json([
                'success' => true,
                'message' => 'Venue deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete venue: ' . $e->getMessage()
            ], 500);
        }
    }
}
