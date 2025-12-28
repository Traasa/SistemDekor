<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentTransactionController extends Controller
{
    /**
     * Display a listing of payment transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PaymentTransaction::with(['order.client']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment type
        if ($request->has('payment_type') && $request->payment_type !== 'all') {
            $query->where('payment_type', $request->payment_type);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('event_name', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform data to use correct fields
        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'order' => [
                    'id' => $payment->order->id,
                    'order_number' => $payment->order->order_number,
                    'client' => [
                        'id' => $payment->order->client->id,
                        'name' => $payment->order->client->name,
                        'phone' => $payment->order->client->phone,
                    ],
                    'event_name' => $payment->order->event_name,
                    'event_date' => $payment->order->event_date,
                    'total_price' => (float) ($payment->order->total_price ?? 0),
                    'final_price' => (float) ($payment->order->final_price ?? $payment->order->total_price ?? 0),
                    'deposit_amount' => (float) ($payment->order->deposit_amount ?? 0),
                    'status' => $payment->order->status,
                ],
                'amount' => (float) $payment->amount,
                'payment_type' => $payment->payment_type,
                'payment_method' => $payment->payment_method,
                'payment_date' => $payment->payment_date,
                'status' => $payment->status,
                'proof_url' => $payment->proof_url,
                'notes' => $payment->notes,
                'created_at' => $payment->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'current_page' => $payments->currentPage(),
            'last_page' => $payments->lastPage(),
            'per_page' => $payments->perPage(),
            'total' => $payments->total(),
        ]);
    }

    /**
     * Store a newly created payment transaction.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:dp,full,installment',
            'payment_method' => 'required|in:cash,transfer,credit_card,debit_card',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment = PaymentTransaction::create(array_merge($validated, [
            'status' => 'pending',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Payment transaction created successfully',
            'data' => $payment->load('order.client'),
        ], 201);
    }

    /**
     * Display the specified payment transaction.
     */
    public function show(string $id): JsonResponse
    {
        $payment = PaymentTransaction::with(['order.client', 'order.package'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    /**
     * Update the specified payment transaction.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $payment = PaymentTransaction::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'payment_type' => 'sometimes|in:dp,full,installment',
            'payment_method' => 'sometimes|in:cash,transfer,credit_card,debit_card',
            'payment_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,verified,rejected',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment transaction updated successfully',
            'data' => $payment->load('order.client'),
        ]);
    }

    /**
     * Verify a payment transaction.
     */
    public function verify(string $id): JsonResponse
    {
        $payment = PaymentTransaction::findOrFail($id);

        if ($payment->status === 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Payment already verified',
            ], 400);
        }

        $payment->update(['status' => 'verified']);

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data' => $payment->load('order.client'),
        ]);
    }

    /**
     * Remove the specified payment transaction.
     */
    public function destroy(string $id): JsonResponse
    {
        $payment = PaymentTransaction::findOrFail($id);
        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment transaction deleted successfully',
        ]);
    }
}
