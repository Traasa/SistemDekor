<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['client', 'package', 'paymentTransactions']);

        // Search by client name or event location
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('event_location', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        $perPage = $request->input('per_page', 10);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'package_id' => 'required|exists:packages,id',
            'event_date' => 'required|date|after:today',
            'event_location' => 'required|string|max:255',
            'guest_count' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::create([
            'client_id' => $request->client_id,
            'package_id' => $request->package_id,
            'event_date' => $request->event_date,
            'event_location' => $request->event_location,
            'guest_count' => $request->guest_count,
            'total_price' => $request->total_price,
            'notes' => $request->notes,
            'status' => 'pending',
            'verification_token' => Str::random(64),
        ]);

        $order->load(['client', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $order,
        ], 201);
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $order = Order::with(['client', 'package', 'paymentTransactions'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'event_date' => 'sometimes|required|date',
            'event_location' => 'sometimes|required|string|max:255',
            'guest_count' => 'sometimes|required|integer|min:1',
            'total_price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:pending,confirmed,processing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order->update($request->only([
            'event_date',
            'event_location',
            'guest_count',
            'total_price',
            'status',
            'notes',
        ]));

        $order->load(['client', 'package']);

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,processing,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order,
        ]);
    }

    /**
     * Remove the specified order
     */
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }
}
