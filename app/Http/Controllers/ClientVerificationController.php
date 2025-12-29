<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientVerificationController extends Controller
{
    /**
     * Display a listing of pending verification orders for admin
     */
    public function index(Request $request)
    {
        $query = Order::with(['client', 'package', 'paymentTransactions'])
            ->whereIn('status', [
                Order::STATUS_PENDING,
                Order::STATUS_NEGOTIATION,
                Order::STATUS_AWAITING_DP,
            ])
            ->orWhereHas('paymentTransactions', function($q) {
                $q->where('status', 'pending');
            });

        // Search functionality
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('order_number', 'like', "%{$searchTerm}%")
                  ->orWhereHas('client', function($clientQuery) use ($searchTerm) {
                      $clientQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $orders = $query->latest()->paginate(10);

        return Inertia::render('admin/client-verification/index', [
            'orders' => $orders,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Get orders for API endpoint
     */
    public function getOrders(Request $request)
    {
        $query = Order::with(['client', 'package', 'paymentTransactions'])
            ->whereIn('status', [
                Order::STATUS_PENDING,
                Order::STATUS_NEGOTIATION,
                Order::STATUS_AWAITING_DP,
            ])
            ->orWhereHas('paymentTransactions', function($q) {
                $q->where('status', 'pending');
            });

        // Search functionality
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('order_number', 'like', "%{$searchTerm}%")
                  ->orWhereHas('client', function($clientQuery) use ($searchTerm) {
                      $clientQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $orders = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json($orders);
    }

    /**
     * Display order verification page by token (public access)
     * 
     * This allows clients to view their order status without logging in
     * by accessing a unique URL with verification token
     */
    public function show($token)
    {
        $order = Order::where('verification_token', $token)
            ->with([
                'client',
                'package',
                'orderDetails',
                'paymentTransactions' => function ($query) {
                    $query->orderBy('payment_date', 'desc');
                }
            ])
            ->firstOrFail();

        // Calculate payment summary
        $totalPaid = $order->paymentTransactions()
            ->where('status', 'verified')
            ->sum('amount');

        $dpTransaction = $order->paymentTransactions()
            ->where('payment_type', 'DP')
            ->where('status', 'verified')
            ->first();

        $pelunasanTransaction = $order->paymentTransactions()
            ->where('payment_type', 'Pelunasan')
            ->where('status', 'verified')
            ->first();

        $remainingPayment = $order->total_price - $totalPaid;

        return Inertia::render('ClientVerification/OrderStatus', [
            'order' => $order,
            'paymentSummary' => [
                'total_price' => $order->total_price,
                'total_paid' => $totalPaid,
                'remaining_payment' => $remainingPayment,
                'dp_status' => $dpTransaction ? 'paid' : 'unpaid',
                'dp_amount' => $dpTransaction?->amount ?? 0,
                'dp_date' => $dpTransaction?->payment_date ?? null,
                'pelunasan_status' => $pelunasanTransaction ? 'paid' : 'unpaid',
                'pelunasan_amount' => $pelunasanTransaction?->amount ?? 0,
                'pelunasan_date' => $pelunasanTransaction?->payment_date ?? null,
            ],
        ]);
    }

    /**
     * Approve/verify an order
     */
    public function approveOrder($id)
    {
        $order = Order::findOrFail($id);

        $order->update([
            'status' => Order::STATUS_CONFIRMED,
        ]);

        return response()->json([
            'message' => 'Order berhasil diverifikasi',
            'order' => $order,
        ]);
    }

    /**
     * Reject an order
     */
    public function rejectOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'notes' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Order berhasil ditolak',
            'order' => $order,
        ]);
    }

    /**
     * Approve/verify payment proof
     */
    public function approvePayment($orderId, $paymentId)
    {
        $order = Order::findOrFail($orderId);
        $payment = PaymentTransaction::where('order_id', $orderId)
            ->where('id', $paymentId)
            ->firstOrFail();

        $payment->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // Update order payment status
        $totalPaid = $order->paymentTransactions()
            ->where('status', 'verified')
            ->sum('amount');

        if ($totalPaid >= $order->final_price) {
            $order->update([
                'payment_status' => Order::PAYMENT_PAID,
                'status' => Order::STATUS_CONFIRMED,
            ]);
        } elseif ($payment->payment_type === 'DP') {
            $order->update([
                'payment_status' => Order::PAYMENT_DP_PAID,
                'status' => Order::STATUS_DP_PAID,
            ]);
        }

        return response()->json([
            'message' => 'Pembayaran berhasil diverifikasi',
            'payment' => $payment,
            'order' => $order->fresh(),
        ]);
    }

    /**
     * Reject payment proof
     */
    public function rejectPayment(Request $request, $orderId, $paymentId)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $payment = PaymentTransaction::where('order_id', $orderId)
            ->where('id', $paymentId)
            ->firstOrFail();

        $payment->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'rejected_at' => now(),
            'rejected_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Pembayaran ditolak',
            'payment' => $payment,
        ]);
    }

    /**
     * Get statistics for verification dashboard
     */
    public function getStats()
    {
        $pendingOrders = Order::whereIn('status', [
            Order::STATUS_PENDING,
            Order::STATUS_NEGOTIATION,
        ])->count();

        $pendingPayments = PaymentTransaction::where('status', 'pending')->count();

        $awaitingDP = Order::where('status', Order::STATUS_AWAITING_DP)->count();

        $todayOrders = Order::whereDate('created_at', today())
            ->whereIn('status', [Order::STATUS_PENDING, Order::STATUS_NEGOTIATION])
            ->count();

        return response()->json([
            'pending_orders' => $pendingOrders,
            'pending_payments' => $pendingPayments,
            'awaiting_dp' => $awaitingDP,
            'today_orders' => $todayOrders,
        ]);
    }
}
