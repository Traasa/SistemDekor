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
            'total_price' => 'required|numeric|min:0',
            'dp_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'special_requests' => 'nullable|string',
            // Payment fields
            'payment_type' => 'required|in:dp,full',
            'payment_method' => 'required|in:cash,transfer,credit_card,debit_card',
            'payment_amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

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
                'total_price' => $validated['total_price'],
                'dp_amount' => $validated['dp_amount'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
            ]);

            // Create payment transaction
            $payment = PaymentTransaction::create([
                'order_id' => $order->id,
                'amount' => $validated['payment_amount'],
                'payment_type' => $validated['payment_type'],
                'payment_method' => $validated['payment_method'],
                'payment_date' => $validated['payment_date'],
                'status' => 'pending',
                'notes' => $validated['payment_notes'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat!',
                'data' => [
                    'order' => $order->load(['client', 'package']),
                    'payment' => $payment,
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
