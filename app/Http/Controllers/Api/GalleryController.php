<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GalleryController extends Controller
{
    /**
     * Display a listing of gallery items
     */
    public function index(Request $request): JsonResponse
    {
        $query = Gallery::query();

        // Filter by category if provided
        if ($request->has('category')) {
            $query->category($request->category);
        }

        // Filter featured items
        if ($request->has('featured')) {
            $query->featured();
        }

        $galleries = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $galleries
        ]);
    }

    /**
     * Store a newly created gallery item
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_path' => 'required|string',
            'category' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $gallery = Gallery::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Gallery item created successfully',
            'data' => $gallery
        ], 201);
    }

    /**
     * Display the specified gallery item
     */
    public function show(Gallery $gallery): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $gallery
        ]);
    }

    /**
     * Update the specified gallery item
     */
    public function update(Request $request, Gallery $gallery): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image_path' => 'sometimes|required|string',
            'category' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $gallery->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Gallery item updated successfully',
            'data' => $gallery
        ]);
    }

    /**
     * Remove the specified gallery item
     */
    public function destroy(Gallery $gallery): JsonResponse
    {
        $gallery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gallery item deleted successfully'
        ]);
    }
}
