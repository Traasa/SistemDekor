<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class ClientVerificationController extends Controller
{
    /**
     * Display order verification by token
     * 
     * This allows clients to view their order status without logging in
     * by accessing via verification token
     */
    public function show(string $token): JsonResponse
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
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or invalid verification token'
            ], 404);
        }

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

        return response()->json([
            'success' => true,
            'data' => [
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
                ]
            ]
        ]);
    }
}
