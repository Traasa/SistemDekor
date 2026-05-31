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
    public function index(Request $request): JsonResponse
    {
        $query = Package::query()->orderBy('base_price');

        $isAdminRequest = $request->boolean('admin') && auth()->check();

        if (!$isAdminRequest) {
            $query->where('is_active', true);
        } else {
            $query->with(['inventoryItems.category', 'venue']);
        }

        $packages = $query->get();

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
            ->with(['venue'])
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
            'includes_venue' => 'nullable|boolean',
            'venue_id' => 'nullable|exists:venues,id',
            'venue_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'inventory_items' => 'nullable|array',
            'inventory_items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'inventory_items.*.quantity' => 'required|integer|min:1',
            'inventory_items.*.notes' => 'nullable|string',
        ]);

        $payload = collect($validated)->except('inventory_items')->toArray();
        $includesVenue = (bool) ($payload['includes_venue'] ?? false);

        if (!$includesVenue) {
            $payload['venue_id'] = null;
            $payload['venue_price'] = 0;
        } else {
            $payload['venue_price'] = (float) ($payload['venue_price'] ?? 0);
        }

        $package = Package::create($payload);

        if (!empty($validated['inventory_items'])) {
            $syncPayload = [];
            foreach ($validated['inventory_items'] as $item) {
                $syncPayload[$item['inventory_item_id']] = [
                    'quantity' => $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ];
            }
            $package->inventoryItems()->sync($syncPayload);
        }

        $package->load(['inventoryItems.category', 'venue']);

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
            'includes_venue' => 'nullable|boolean',
            'venue_id' => 'nullable|exists:venues,id',
            'venue_price' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'inventory_items' => 'nullable|array',
            'inventory_items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'inventory_items.*.quantity' => 'required|integer|min:1',
            'inventory_items.*.notes' => 'nullable|string',
        ]);

        $payload = collect($validated)->except('inventory_items')->toArray();

        if (array_key_exists('includes_venue', $payload)) {
            $includesVenue = (bool) $payload['includes_venue'];
            if (!$includesVenue) {
                $payload['venue_id'] = null;
                $payload['venue_price'] = 0;
            }
        }

        if (array_key_exists('venue_price', $payload)) {
            $payload['venue_price'] = (float) $payload['venue_price'];
        }

        $package->update($payload);

        if (array_key_exists('inventory_items', $validated)) {
            $syncPayload = [];
            foreach ($validated['inventory_items'] as $item) {
                $syncPayload[$item['inventory_item_id']] = [
                    'quantity' => $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ];
            }
            $package->inventoryItems()->sync($syncPayload);
        }

        $package->load(['inventoryItems.category', 'venue']);

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
