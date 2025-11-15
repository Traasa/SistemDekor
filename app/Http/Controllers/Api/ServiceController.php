<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Display a listing of services
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        // Filter by category if provided
        if ($request->has('category')) {
            $query->category($request->category);
        }

        // Filter active services for public access
        if ($request->has('active_only')) {
            $query->active();
        }

        $services = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * Store a newly created service
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $service = Service::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service created successfully',
            'data' => $service
        ], 201);
    }

    /**
     * Display the specified service
     */
    public function show(Service $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Update the specified service
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $service->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $service
        ]);
    }

    /**
     * Remove the specified service
     */
    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully'
        ]);
    }
}
