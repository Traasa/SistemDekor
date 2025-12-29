<?php

namespace App\Http\Controllers;

use App\Models\VendorRating;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorRatingController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorRating::with(['vendor.category', 'order', 'reviewer']);

        // Filters
        if ($request->has('vendor_id') && $request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->has('min_rating') && $request->min_rating) {
            $query->where('rating', '>=', $request->min_rating);
        }

        if ($request->has('is_verified') && $request->is_verified !== '') {
            $query->where('is_verified', $request->is_verified);
        }

        if ($request->has('would_recommend') && $request->would_recommend !== '') {
            $query->where('would_recommend', $request->would_recommend);
        }

        if ($request->has('has_response')) {
            $query->whereNotNull('vendor_response');
        }

        $ratings = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $ratings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'quality_rating' => 'nullable|integer|min:1|max:5',
            'timeliness_rating' => 'nullable|integer|min:1|max:5',
            'professionalism_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'review' => 'nullable|string',
            'pros' => 'nullable|string',
            'cons' => 'nullable|string',
            'would_recommend' => 'nullable|boolean',
            'is_verified' => 'nullable|boolean'
        ]);

        // Check if user already reviewed this vendor for this order
        if ($request->order_id) {
            $existing = VendorRating::where('vendor_id', $request->vendor_id)
                ->where('order_id', $request->order_id)
                ->where('reviewed_by', auth()->id())
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this vendor for this order'
                ], 422);
            }
        }

        $validated['reviewed_by'] = auth()->id();

        $rating = VendorRating::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
            'data' => $rating->load(['vendor', 'reviewer'])
        ], 201);
    }

    public function show($id)
    {
        $rating = VendorRating::with(['vendor.category', 'order', 'reviewer'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rating
        ]);
    }

    public function update(Request $request, $id)
    {
        $rating = VendorRating::findOrFail($id);

        // Only allow the reviewer to update their own rating
        if ($rating->reviewed_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this rating'
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'quality_rating' => 'nullable|integer|min:1|max:5',
            'timeliness_rating' => 'nullable|integer|min:1|max:5',
            'professionalism_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'review' => 'nullable|string',
            'pros' => 'nullable|string',
            'cons' => 'nullable|string',
            'would_recommend' => 'nullable|boolean'
        ]);

        $rating->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rating updated successfully',
            'data' => $rating->load(['vendor', 'reviewer'])
        ]);
    }

    public function destroy($id)
    {
        $rating = VendorRating::findOrFail($id);

        // Only allow the reviewer to delete their own rating
        if ($rating->reviewed_by !== auth()->id() && !auth()->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this rating'
            ], 403);
        }

        $rating->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rating deleted successfully'
        ]);
    }

    public function byVendor($vendorId)
    {
        $ratings = VendorRating::where('vendor_id', $vendorId)
            ->with(['order', 'reviewer'])
            ->latest()
            ->get();

        $summary = [
            'total_reviews' => $ratings->count(),
            'average_rating' => $ratings->avg('rating'),
            'rating_distribution' => [
                5 => $ratings->where('rating', 5)->count(),
                4 => $ratings->where('rating', 4)->count(),
                3 => $ratings->where('rating', 3)->count(),
                2 => $ratings->where('rating', 2)->count(),
                1 => $ratings->where('rating', 1)->count(),
            ],
            'would_recommend_count' => $ratings->where('would_recommend', true)->count(),
            'verified_count' => $ratings->where('is_verified', true)->count()
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'ratings' => $ratings,
                'summary' => $summary
            ]
        ]);
    }

    public function addResponse(Request $request, $id)
    {
        $rating = VendorRating::findOrFail($id);

        $validated = $request->validate([
            'vendor_response' => 'required|string'
        ]);

        $rating->update([
            'vendor_response' => $validated['vendor_response'],
            'responded_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Response added successfully',
            'data' => $rating
        ]);
    }

    public function pendingReviews()
    {
        // Get vendors that have completed orders but no reviews
        // This would require additional logic based on your order system
        
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }
}
