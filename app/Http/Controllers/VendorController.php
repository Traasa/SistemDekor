<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::with(['category', 'contracts', 'ratings']);

        // Filters
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('rating_level') && $request->rating_level) {
            $query->where('rating_level', $request->rating_level);
        }

        if ($request->has('min_rating') && $request->min_rating) {
            $query->where('average_rating', '>=', $request->min_rating);
        }

        if ($request->has('city') && $request->city) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('vendor_code', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $vendors = $query->withCount(['contracts', 'ratings'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:vendor_categories,id',
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:vendors,email',
            'phone' => 'required|string|max:20',
            'alternative_phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'status' => 'nullable|in:active,inactive,blacklisted',
            'rating_level' => 'nullable|in:platinum,gold,silver,bronze,standard',
            'services_offered' => 'nullable|array',
            'minimum_order' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:0',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'business_license' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        $vendor = Vendor::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully',
            'data' => $vendor->load('category')
        ], 201);
    }

    public function show($id)
    {
        $vendor = Vendor::with([
            'category',
            'contracts' => function($query) {
                $query->latest();
            },
            'ratings' => function($query) {
                $query->with('reviewer')->latest();
            }
        ])
        ->withCount(['contracts', 'ratings'])
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vendor
        ]);
    }

    public function update(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:vendor_categories,id',
            'company_name' => 'sometimes|string|max:255',
            'contact_person' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:vendors,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'alternative_phone' => 'nullable|string|max:20',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'province' => 'sometimes|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'status' => 'sometimes|in:active,inactive,blacklisted',
            'rating_level' => 'sometimes|in:platinum,gold,silver,bronze,standard',
            'services_offered' => 'nullable|array',
            'minimum_order' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:0',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'business_license' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        $vendor->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vendor updated successfully',
            'data' => $vendor->load('category')
        ]);
    }

    public function destroy($id)
    {
        $vendor = Vendor::findOrFail($id);

        // Check if vendor has active contracts
        if ($vendor->hasActiveContract()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete vendor with active contracts'
            ], 422);
        }

        $vendor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted successfully'
        ]);
    }

    public function activeVendors()
    {
        $vendors = Vendor::with('category')
            ->active()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    public function statistics($id)
    {
        $vendor = Vendor::with(['contracts', 'ratings', 'performance'])
            ->findOrFail($id);

        $stats = [
            'total_contracts' => $vendor->contracts()->count(),
            'active_contracts' => $vendor->contracts()->active()->count(),
            'total_reviews' => $vendor->ratings()->count(),
            'average_rating' => $vendor->average_rating,
            'verified_reviews' => $vendor->ratings()->verified()->count(),
            'would_recommend_rate' => $vendor->ratings()->where('would_recommend', true)->count() / max($vendor->ratings()->count(), 1) * 100,
            'total_contract_value' => $vendor->contracts()->active()->sum('contract_value'),
            'has_active_contract' => $vendor->hasActiveContract()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
