<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    /**
     * Display a listing of active packages.
     */
    public function index(): JsonResponse
    {
        $packages = Package::where('is_active', true)
            ->orderBy('base_price')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $packages
        ]);
    }

    /**
     * Display the specified package by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $package = Package::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Package not found'
            ], 404);
        }

        // Get other packages
        $otherPackages = Package::where('is_active', true)
            ->where('id', '!=', $package->id)
            ->take(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'package' => $package,
                'otherPackages' => $otherPackages
            ]
        ]);
    }

    /**
     * Store a newly created package (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $package = Package::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Package created successfully',
            'data' => $package
        ], 201);
    }

    /**
     * Update the specified package (admin only).
     */
    public function update(Request $request, Package $package): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'base_price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $package->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Package updated successfully',
            'data' => $package
        ]);
    }

    /**
     * Remove the specified package (admin only).
     */
    public function destroy(Package $package): JsonResponse
    {
        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Package deleted successfully'
        ]);
    }
}
