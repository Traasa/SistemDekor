<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyProfileController extends Controller
{
    /**
     * Display the company profile (public)
     */
    public function index(): JsonResponse
    {
        $profile = CompanyProfile::first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Company profile not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    /**
     * Store a newly created company profile (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can create company profile.'
            ], 403);
        }

        $request->validate([
            'company_name' => 'required|string|max:255',
            'about' => 'required|string',
            'services' => 'required|array',
            'services.*' => 'string',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'social_media' => 'nullable|array',
        ]);

        $profile = CompanyProfile::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $profile,
            'message' => 'Company profile created successfully'
        ], 201);
    }

    /**
     * Display the specified company profile
     */
    public function show(CompanyProfile $companyProfile): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $companyProfile,
        ]);
    }

    /**
     * Update the specified company profile (Admin only)
     */
    public function update(Request $request, CompanyProfile $companyProfile): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can update company profile.'
            ], 403);
        }

        $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'about' => 'sometimes|string',
            'services' => 'sometimes|array',
            'services.*' => 'string',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'social_media' => 'nullable|array',
        ]);

        $companyProfile->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $companyProfile,
            'message' => 'Company profile updated successfully'
        ]);
    }

    /**
     * Remove the specified company profile (Admin only)
     */
    public function destroy(Request $request, CompanyProfile $companyProfile): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete company profile.'
            ], 403);
        }

        $companyProfile->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company profile deleted successfully'
        ]);
    }
}
