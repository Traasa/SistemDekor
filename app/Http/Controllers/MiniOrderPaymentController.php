<?php

namespace App\Http\Controllers;

use App\Models\MiniOrder;
use App\Models\MiniOrderPaymentProof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MiniOrderPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = MiniOrderPaymentProof::with(['miniOrder.vendorClient'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
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

        $paymentProofs = $query->paginate(15);

        $paymentProofs->getCollection()->transform(function ($proof) {
            return [
                'id' => $proof->id,
                'mini_order_id' => $proof->mini_order_id,
                'order' => [
                    'id' => $proof->miniOrder->id,
                    'order_number' => $proof->miniOrder->order_number,
                    'vendor_client' => [
                        'name' => $proof->miniOrder->vendorClient->name,
                    ],
                    'final_price' => (float) $proof->miniOrder->final_price,
                    'deposit_amount' => (float) $proof->miniOrder->deposit_amount,
                    'payment_status' => $proof->miniOrder->payment_status,
                ],
                'amount' => (float) $proof->amount,
                'payment_type' => $proof->payment_type,
                'proof_image' => $proof->proof_image_path
                    ? asset('storage/' . $proof->proof_image_path)
                    : null,
                'notes' => $proof->admin_notes,
                'status' => $proof->status,
                'verified_at' => $proof->verified_at ? $proof->verified_at->toISOString() : null,
                'verified_by' => $proof->verified_by,
                'created_at' => $proof->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $paymentProofs->items(),
            'current_page' => $paymentProofs->currentPage(),
            'last_page' => $paymentProofs->lastPage(),
            'per_page' => $paymentProofs->perPage(),
            'total' => $paymentProofs->total(),
        ]);
    }

    public function generateLink(Request $request, $orderId)
    {
        $request->validate([
            'hours_valid' => 'nullable|integer|min:1|max:168',
            'payment_type' => 'nullable|in:dp,installment,full',
            'payment_amount' => 'nullable|numeric|min:0',
        ]);

        $order = MiniOrder::with(['vendorClient'])->findOrFail($orderId);

        if ($order->is_negotiable) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order masih dalam negosiasi. Finalisasi terlebih dahulu.',
            ], 400);
        }

        $paymentType = $request->input('payment_type');
        if (!$paymentType) {
            if (in_array($order->payment_status, ['unpaid', 'dp_pending'], true)) {
                $paymentType = 'dp';
            } elseif (in_array($order->payment_status, ['dp_paid', 'partial', 'full_pending'], true)) {
                $paymentType = 'installment';
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Status pembayaran tidak memenuhi syarat untuk generate link.',
                ], 400);
            }
        }

        if ($order->payment_link_active && !$order->isPaymentLinkExpired() && $order->payment_link_type === $paymentType) {
            return response()->json([
                'success' => false,
                'message' => 'Mini order sudah memiliki payment link aktif untuk tipe ini.',
                'link' => route('mini-payment.show', ['token' => $order->payment_link_token]),
                'payment_type' => $paymentType,
            ], 400);
        }

        $hoursValid = $request->input('hours_valid', 48);
        $paymentLink = $order->generatePaymentLink($hoursValid, $paymentType);
        $paymentAmount = $request->input('payment_amount');

        if ($paymentType === 'installment' && $paymentAmount !== null) {
            $order->payment_link_amount = (float) $paymentAmount;
        } else {
            $order->payment_link_amount = null;
        }

        if ($paymentType === 'dp' && $paymentAmount !== null) {
            $order->dp_amount = (float) $paymentAmount;
        }

        if ($paymentType === 'dp') {
            $order->payment_status = 'dp_pending';
        } elseif ($paymentType === 'installment') {
            $order->payment_status = 'partial';
        } else {
            $order->payment_status = 'full_pending';
        }
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment link generated successfully',
            'link' => $paymentLink,
            'payment_type' => $paymentType,
            'expires_at' => $order->payment_link_expires_at->format('Y-m-d H:i:s'),
        ]);
    }

    public function show($token)
    {
        $order = MiniOrder::where('payment_link_token', $token)
            ->with(['vendorClient'])
            ->firstOrFail();

        if ($order->isPaymentLinkExpired()) {
            return Inertia::render('PaymentExpiredPage', [
                'message' => 'Payment link has expired. Please contact admin for a new link.',
            ]);
        }

        if (!$order->payment_link_active) {
            return Inertia::render('PaymentExpiredPage', [
                'message' => 'Payment link is no longer active. Please contact admin.',
            ]);
        }

        return Inertia::render('PaymentPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'client_name' => $order->vendorClient->name,
                'client_email' => $order->vendorClient->email,
                'event_name' => $order->event_name,
                'event_date' => $order->event_date ? $order->event_date->format('d M Y') : '-',
                'package_name' => 'Mini Order',
                'total_price' => $order->total_price ?? 0,
                'final_price' => $order->final_price ?? $order->total_price ?? 0,
                'dp_amount' => $order->dp_amount ?? 0,
                    'booking_amount' => 0,
                'deposit_amount' => $order->deposit_amount ?? 0,
                'remaining_amount' => $order->remaining_amount ?? $order->final_price ?? 0,
                'payment_link_type' => $order->payment_link_type,
                'payment_link_amount' => $order->payment_link_amount,
                'payment_status' => $order->payment_status,
            ],
            'token' => $token,
            'upload_url' => route('mini-payment.upload', ['token' => $token]),
        ]);
    }

    public function upload(Request $request, $token)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:dp,installment,full',
            'proof_image' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $order = MiniOrder::where('payment_link_token', $token)->firstOrFail();

        if ($order->isPaymentLinkExpired() || !$order->payment_link_active) {
            return response()->json([
                'success' => false,
                'message' => 'Payment link is no longer valid',
            ], 400);
        }

        if ($order->payment_link_type && $request->payment_type !== $order->payment_link_type) {
            return response()->json([
                'success' => false,
                'message' => 'Tipe pembayaran tidak sesuai dengan link pembayaran yang diberikan.',
            ], 400);
        }

        $verifiedPaid = (float) $order->paymentProofs()->where('status', MiniOrderPaymentProof::STATUS_VERIFIED)->sum('amount');
        $remaining = max(0, (float) $order->final_price - $verifiedPaid);

        
        if ($request->payment_type === 'dp' && $order->dp_amount > 0) {
            if (abs((float) $request->amount - (float) $order->dp_amount) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominal DP harus sesuai dengan jumlah yang telah ditentukan.',
                ], 400);
            }
        }

        if ($request->payment_type === 'full' && abs((float) $request->amount - $remaining) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Nominal pelunasan harus sesuai dengan sisa tagihan.',
            ], 400);
        }

        if ($request->payment_type === 'installment' && $order->payment_link_amount) {
            if (abs((float) $request->amount - (float) $order->payment_link_amount) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nominal cicilan harus sesuai dengan jumlah yang telah ditentukan.',
                ], 400);
            }
        }

        if ((float) $request->amount > $remaining) {
            return response()->json([
                'success' => false,
                'message' => 'Nominal pembayaran tidak boleh melebihi sisa tagihan.',
            ], 400);
        }

        $path = $request->file('proof_image')->store('mini_payment_proofs', 'public');

        $paymentProof = MiniOrderPaymentProof::create([
            'mini_order_id' => $order->id,
            'amount' => $request->amount,
            'payment_type' => $request->payment_type,
            'proof_image_path' => $path,
            'status' => MiniOrderPaymentProof::STATUS_PENDING,
        ]);

        $order->payment_link_active = false;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment proof uploaded successfully. Admin will verify your payment shortly.',
            'payment_proof_id' => $paymentProof->id,
        ]);
    }

    public function verify(Request $request, $proofId)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $paymentProof = MiniOrderPaymentProof::with(['miniOrder.vendorClient'])->findOrFail($proofId);

        if ($paymentProof->status !== MiniOrderPaymentProof::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof has already been processed',
            ], 400);
        }

        DB::transaction(function () use ($paymentProof, $request) {
            $paymentProof->status = MiniOrderPaymentProof::STATUS_VERIFIED;
            $paymentProof->verified_by = Auth::id();
            $paymentProof->verified_at = now();
            $paymentProof->admin_notes = $request->admin_notes;
            $paymentProof->save();

            $order = $paymentProof->miniOrder->fresh(['paymentProofs']);
            $totalPaid = (float) $order->paymentProofs()->where('status', MiniOrderPaymentProof::STATUS_VERIFIED)->sum('amount');
            $dpPaid = (float) $order->paymentProofs()
                ->where('status', MiniOrderPaymentProof::STATUS_VERIFIED)
                ->where('payment_type', 'dp')
                ->sum('amount');

            if ($totalPaid >= (float) $order->final_price) {
                $order->payment_status = 'paid';
                $order->status = 'paid';
            } elseif ($dpPaid > 0) {
                $order->payment_status = $totalPaid > $dpPaid ? 'partial' : 'dp_paid';
                $order->status = 'dp_paid';
            } else {
                $order->payment_status = 'partial';
                $order->status = 'awaiting_full_payment';
            }

            $order->deposit_amount = $dpPaid;
            $order->remaining_amount = max(0, (float) $order->final_price - $totalPaid);
            $order->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
        ]);
    }

    public function reject(Request $request, $proofId)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $paymentProof = MiniOrderPaymentProof::with('miniOrder')->findOrFail($proofId);

        if ($paymentProof->status !== MiniOrderPaymentProof::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof has already been processed',
            ], 400);
        }

        $paymentProof->status = MiniOrderPaymentProof::STATUS_REJECTED;
        $paymentProof->verified_by = Auth::id();
        $paymentProof->verified_at = now();
        $paymentProof->admin_notes = $request->admin_notes;
        $paymentProof->save();

        $order = $paymentProof->miniOrder;
        $order->payment_link_active = true;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment rejected. Payment link has been reactivated.',
        ]);
    }
}
