<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MiniOrderPaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MiniPaymentTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MiniOrderPaymentTransaction::with(['miniOrder.vendorClient']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_type') && $request->payment_type !== 'all') {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('miniOrder', function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('event_name', 'like', "%{$search}%")
                    ->orWhereHas('vendorClient', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'mini_order_id' => $payment->mini_order_id,
                'order' => [
                    'id' => $payment->miniOrder->id,
                    'order_number' => $payment->miniOrder->order_number,
                    'vendor_client' => [
                        'id' => $payment->miniOrder->vendorClient->id,
                        'name' => $payment->miniOrder->vendorClient->name,
                        'phone' => $payment->miniOrder->vendorClient->phone,
                    ],
                    'event_name' => $payment->miniOrder->event_name,
                    'event_date' => $payment->miniOrder->event_date,
                    'total_price' => (float) ($payment->miniOrder->total_price ?? 0),
                    'final_price' => (float) ($payment->miniOrder->final_price ?? $payment->miniOrder->total_price ?? 0),
                    'deposit_amount' => (float) ($payment->miniOrder->deposit_amount ?? 0),
                    'status' => $payment->miniOrder->status,
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
}
