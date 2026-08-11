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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'inventory_items_json' => 'nullable|string',
        ]);

        $payload = collect($validated)->except(['inventory_items_json', 'image'])->toArray();
        $includesVenue = (bool) ($payload['includes_venue'] ?? false);

        if (!$includesVenue) {
            $payload['venue_id'] = null;
        }

        if ($request->hasFile('image')) {
            $payload['image_url'] = $request->file('image')->store('packages', 'public');
        }

        $package = Package::create($payload);

        if (!empty($validated['inventory_items_json'])) {
            $inventoryItems = json_decode($validated['inventory_items_json'], true);
            if (is_array($inventoryItems)) {
                $syncPayload = [];
                foreach ($inventoryItems as $item) {
                    if (isset($item['inventory_item_id']) && isset($item['quantity'])) {
                        $syncPayload[$item['inventory_item_id']] = [
                            'quantity' => $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                        ];
                    }
                }
                $package->inventoryItems()->sync($syncPayload);
            }
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'inventory_items_json' => 'nullable|string',
        ]);

        $payload = collect($validated)->except(['inventory_items_json', 'image'])->toArray();

        if (array_key_exists('includes_venue', $payload)) {
            $includesVenue = (bool) $payload['includes_venue'];
            if (!$includesVenue) {
                $payload['venue_id'] = null;
            }
        }

        if ($request->hasFile('image')) {
            $payload['image_url'] = $request->file('image')->store('packages', 'public');
        }

        $package->update($payload);

        if (array_key_exists('inventory_items_json', $validated) && !empty($validated['inventory_items_json'])) {
            $inventoryItems = json_decode($validated['inventory_items_json'], true);
            if (is_array($inventoryItems)) {
                $syncPayload = [];
                foreach ($inventoryItems as $item) {
                    if (isset($item['inventory_item_id']) && isset($item['quantity'])) {
                        $syncPayload[$item['inventory_item_id']] = [
                            'quantity' => $item['quantity'],
                            'notes' => $item['notes'] ?? null,
                        ];
                    }
                }
                $package->inventoryItems()->sync($syncPayload);
            }
        } elseif (array_key_exists('inventory_items_json', $validated) && empty($validated['inventory_items_json'])) {
            $package->inventoryItems()->sync([]);
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
