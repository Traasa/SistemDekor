<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestimonialController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::query();

        if ($request->has('featured')) {
            $query->featured();
        }

        $testimonials = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $testimonials
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_name' => 'required|string|max:255',
            'event_type' => 'nullable|string|max:255',
            'testimonial' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'photo_url' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        $testimonial = Testimonial::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Testimonial created successfully',
            'data' => $testimonial
        ], 201);
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $testimonial
        ]);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $request->validate([
            'client_name' => 'sometimes|required|string|max:255',
            'event_type' => 'nullable|string|max:255',
            'testimonial' => 'sometimes|required|string',
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'photo_url' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        $testimonial->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Testimonial updated successfully',
            'data' => $testimonial
        ]);
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Testimonial deleted successfully'
        ]);
    }
}

