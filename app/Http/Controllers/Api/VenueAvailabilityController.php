<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VenueAvailability;
use App\Models\VenueBooking;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VenueAvailabilityController extends Controller
{
    /**
     * Get availability calendar for venues
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $venueId = $request->input('venue_id');
            $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

            $query = VenueAvailability::with('venue');

            if ($venueId) {
                $query->where('venue_id', $venueId);
            }

            $availability = $query->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date')
                ->get();

            // Also get bookings in this date range
            $bookingsQuery = VenueBooking::with('venue')
                ->whereBetween('booking_date', [$startDate, $endDate])
                ->whereIn('status', ['pending', 'confirmed']);

            if ($venueId) {
                $bookingsQuery->where('venue_id', $venueId);
            }

            $bookings = $bookingsQuery->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'availability' => $availability,
                    'bookings' => $bookings,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set venue availability for specific dates
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'venue_id' => 'required|exists:venues,id',
            'date' => 'required|date',
            'is_available' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $availability = VenueAvailability::updateOrCreate(
                [
                    'venue_id' => $request->venue_id,
                    'date' => $request->date,
                ],
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Availability updated successfully',
                'data' => $availability->load('venue')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update availability for date range
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'venue_id' => 'required|exists:venues,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_available' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $dates = [];

            while ($startDate->lte($endDate)) {
                VenueAvailability::updateOrCreate(
                    [
                        'venue_id' => $request->venue_id,
                        'date' => $startDate->format('Y-m-d'),
                    ],
                    [
                        'is_available' => $request->is_available,
                        'unavailable_reason' => $request->unavailable_reason,
                        'notes' => $request->notes,
                    ]
                );

                $dates[] = $startDate->format('Y-m-d');
                $startDate->addDay();
            }

            return response()->json([
                'success' => true,
                'message' => 'Availability updated for ' . count($dates) . ' dates',
                'data' => ['dates' => $dates]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if venue is available on specific date
     */
    public function check(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'venue_id' => 'required|exists:venues,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $venue = Venue::findOrFail($request->venue_id);
            $isAvailable = $venue->isAvailableOn($request->date);

            $availability = VenueAvailability::where('venue_id', $request->venue_id)
                ->where('date', $request->date)
                ->first();

            $bookings = VenueBooking::where('venue_id', $request->venue_id)
                ->where('booking_date', $request->date)
                ->whereIn('status', ['pending', 'confirmed'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_available' => $isAvailable,
                    'availability_record' => $availability,
                    'bookings' => $bookings,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check availability: ' . $e->getMessage()
            ], 500);
        }
    }
}
