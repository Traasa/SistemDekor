<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    /**
     * Display a listing of portfolios.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Portfolio::query();

        // Filter by category if provided
        if ($request->has('category') && $request->category != '') {
            $query->where('category', $request->category);
        }

        // Filter by featured
        if ($request->has('featured') && $request->featured) {
            $query->where('is_featured', true);
        }

        $portfolios = $query->latest()->paginate($request->get('per_page', 12));

        // Get unique categories
        $categories = Portfolio::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $portfolios,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created portfolio (admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'is_featured' => 'boolean'
        ]);

        $portfolio = Portfolio::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Portfolio created successfully',
            'data' => $portfolio
        ], 201);
    }

    /**
     * Display the specified portfolio.
     */
    public function show(Portfolio $portfolio): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $portfolio
        ]);
    }

    /**
     * Update the specified portfolio (admin only).
     */
    public function update(Request $request, Portfolio $portfolio): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:100',
            'is_featured' => 'boolean'
        ]);

        $portfolio->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Portfolio updated successfully',
            'data' => $portfolio
        ]);
    }

    /**
     * Remove the specified portfolio (admin only).
     */
    public function destroy(Portfolio $portfolio): JsonResponse
    {
        $portfolio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Portfolio deleted successfully'
        ]);
    }
}
