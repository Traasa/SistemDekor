<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MiniOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = MiniOrder::with(['vendorClient', 'paymentTransactions', 'paymentProofs']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('event_location', 'like', "%{$search}%")
                    ->orWhere('event_name', 'like', "%{$search}%")
                    ->orWhereHas('vendorClient', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        if ($request->has('per_page') && $request->per_page !== 'all') {
            $perPage = $request->input('per_page', 10);
            $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $orders,
            ]);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_client_id' => 'required|exists:vendor_clients,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'event_date' => 'required|date',
            'event_address' => 'required|string',
            'event_location' => 'nullable|string|max:255',
            'total_price' => 'nullable|numeric|min:0',
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

        $totalPrice = (float) ($request->total_price ?? 0);
        $finalPrice = $totalPrice;
        $isNegotiable = $totalPrice <= 0 ? true : false;

        $order = MiniOrder::create([
            'vendor_client_id' => $request->vendor_client_id,
            'event_name' => $request->event_name,
            'event_type' => $request->event_type,
            'event_date' => $request->event_date,
            'event_address' => $request->event_address,
            'event_location' => $request->event_location,
            'total_price' => $totalPrice,
            'discount' => 0,
            'final_price' => $finalPrice,
            'dp_amount' => 0,
            'deposit_amount' => 0,
            'remaining_amount' => $finalPrice,
            'status' => 'pending_confirmation',
            'payment_status' => 'unpaid',
            'is_negotiable' => $isNegotiable,
            'notes' => $request->notes,
            'special_requests' => $request->special_requests,
        ]);

        $order->load('vendorClient');

        return response()->json([
            'success' => true,
            'message' => 'Mini order created successfully',
            'data' => $order,
        ], 201);
    }

    public function show($id)
    {
        $order = MiniOrder::with(['vendorClient', 'paymentTransactions'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = MiniOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'event_date' => 'sometimes|required|date',
            'event_location' => 'sometimes|required|string|max:255',
            'event_name' => 'sometimes|required|string|max:255',
            'event_address' => 'sometimes|required|string',
            'total_price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|string',
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
            'event_name',
            'event_address',
            'total_price',
            'status',
            'notes',
        ]));

        $order->load('vendorClient');

        return response()->json([
            'success' => true,
            'message' => 'Mini order updated successfully',
            'data' => $order,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = MiniOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string',
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
            'message' => 'Mini order status updated successfully',
            'data' => $order,
        ]);
    }

    public function destroy($id)
    {
        $order = MiniOrder::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order not found',
            ], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mini order deleted successfully',
        ]);
    }
}
