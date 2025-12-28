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

        // Check if pagination is requested
        if ($request->has('per_page') && $request->per_page !== 'all') {
            $perPage = $request->input('per_page', 10);
            $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $orders,
            ]);
        }
        
        // Return all orders without pagination
        $orders = $query->orderBy('created_at', 'desc')->get();

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
            'package_id' => 'nullable|exists:packages,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'event_date' => 'required|date|after:today',
            'event_address' => 'required|string',
            'event_location' => 'nullable|string|max:255',
            'event_theme' => 'nullable|string|max:255',
            'guest_count' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Get package price if package selected, otherwise set to 0 for negotiation
            $totalPrice = 0;
            $finalPrice = 0;
            
            if ($request->package_id) {
                $package = \App\Models\Package::findOrFail($request->package_id);
                $totalPrice = $package->price ?? 0;
                $finalPrice = $totalPrice;
            }
            
            $order = Order::create([
                'client_id' => $request->client_id,
                'package_id' => $request->package_id,
                'user_id' => auth()->id(),
                'event_name' => $request->event_name,
                'event_type' => $request->event_type,
                'event_date' => $request->event_date,
                'event_address' => $request->event_address,
                'event_location' => $request->event_location,
                'event_theme' => $request->event_theme,
                'guest_count' => $request->guest_count,
                'total_price' => $totalPrice,
                'discount' => 0,
                'final_price' => $finalPrice,
                'dp_amount' => 0,
                'deposit_amount' => 0,
                'remaining_amount' => $finalPrice,
                'notes' => $request->notes,
                'special_requests' => $request->special_requests,
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_UNPAID,
                'is_negotiable' => true, // Order baru bisa dinegosiasi
                'verification_token' => Str::random(64),
            ]);

            $order->load(['client', 'package']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage(),
            ], 500);
        }
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
