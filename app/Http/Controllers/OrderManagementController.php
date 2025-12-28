<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Client;
use App\Models\Package;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderManagementController extends Controller
{
    /**
     * Store a newly created order with payment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'package_id' => 'nullable|exists:packages,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:100',
            'event_date' => 'required|date|after_or_equal:today',
            'event_address' => 'required|string',
            'guest_count' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Get package price if package selected, otherwise set to 0 for negotiation
            $totalPrice = 0;
            $finalPrice = 0;
            
            if ($validated['package_id']) {
                $package = Package::findOrFail($validated['package_id']);
                $totalPrice = $package->price ?? 0;
                $finalPrice = $totalPrice;
            }

            // Create order
            $order = Order::create([
                'client_id' => $validated['client_id'],
                'package_id' => $validated['package_id'],
                'user_id' => Auth::id(),
                'event_name' => $validated['event_name'],
                'event_type' => $validated['event_type'],
                'event_date' => $validated['event_date'],
                'event_address' => $validated['event_address'],
                'guest_count' => $validated['guest_count'],
                'total_price' => $totalPrice,
                'discount' => 0,
                'final_price' => $finalPrice,
                'dp_amount' => 0,
                'deposit_amount' => 0,
                'remaining_amount' => $finalPrice,
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_UNPAID,
                'is_negotiable' => true,
                'notes' => $validated['notes'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat!',
                'data' => [
                    'order' => $order->load(['client', 'package']),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order details with payments
     */
    public function show($id)
    {
        $order = Order::with(['client', 'package', 'user', 'paymentTransactions'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status order berhasil diupdate!',
            'data' => $order,
        ]);
    }
}
