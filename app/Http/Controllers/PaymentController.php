<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentProof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Generate payment link for an order (Admin only)
     */
    public function generateLink(Request $request, $orderId)
    {
        $request->validate([
            'hours_valid' => 'nullable|integer|min:1|max:168', // max 7 days
        ]);

        $order = Order::with(['client', 'package'])->findOrFail($orderId);

        // Check if already has active payment link
        if ($order->payment_link_active && !$order->isPaymentLinkExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Order already has an active payment link',
                'link' => route('payment.show', ['token' => $order->payment_link_token]),
            ], 400);
        }

        $hoursValid = $request->input('hours_valid', 48); // Default 48 hours
        $paymentLink = $order->generatePaymentLink($hoursValid);

        return response()->json([
            'success' => true,
            'message' => 'Payment link generated successfully',
            'link' => $paymentLink,
            'expires_at' => $order->payment_link_expires_at->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Show payment upload form for client
     */
    public function show($token)
    {
        $order = Order::where('payment_link_token', $token)
            ->with(['client', 'package'])
            ->firstOrFail();

        // Check if link is expired
        if ($order->isPaymentLinkExpired()) {
            return Inertia::render('PaymentExpiredPage', [
                'message' => 'Payment link has expired. Please contact admin for a new link.',
            ]);
        }

        // Check if link is inactive
        if (!$order->payment_link_active) {
            return Inertia::render('PaymentExpiredPage', [
                'message' => 'Payment link is no longer active. Please contact admin.',
            ]);
        }

        return Inertia::render('PaymentPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'client_name' => $order->client->name,
                'client_email' => $order->client->email,
                'event_name' => $order->event_name,
                'event_date' => $order->event_date ? $order->event_date->format('d M Y') : '-',
                'package_name' => $order->package ? $order->package->name : 'Custom Package',
                'total_price' => $order->total_price ?? 0,
                'final_price' => $order->final_price ?? $order->total_price ?? 0,
                'dp_amount' => $order->dp_amount ?? 0,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle payment proof upload
     */
    public function upload(Request $request, $token)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:dp,full',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB
        ]);

        $order = Order::where('payment_link_token', $token)->firstOrFail();

        // Check if link is expired or inactive
        if ($order->isPaymentLinkExpired() || !$order->payment_link_active) {
            return response()->json([
                'success' => false,
                'message' => 'Payment link is no longer valid',
            ], 400);
        }

        // Validate amount
        if ($request->payment_type === 'dp' && $request->amount > $order->final_price) {
            return response()->json([
                'success' => false,
                'message' => 'DP amount cannot exceed total order amount',
            ], 400);
        }

        if ($request->payment_type === 'full' && $request->amount != $order->final_price) {
            return response()->json([
                'success' => false,
                'message' => 'Full payment amount must match order total',
            ], 400);
        }

        // Store payment proof image
        $path = $request->file('proof_image')->store('payment_proofs', 'public');

        // Create payment proof record
        $paymentProof = PaymentProof::create([
            'order_id' => $order->id,
            'amount' => $request->amount,
            'payment_type' => $request->payment_type,
            'proof_image_path' => $path,
            'status' => PaymentProof::STATUS_PENDING,
        ]);

        // Deactivate payment link after successful upload
        $order->payment_link_active = false;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment proof uploaded successfully. Admin will verify your payment shortly.',
            'payment_proof_id' => $paymentProof->id,
        ]);
    }

    /**
     * Verify payment proof (Admin only)
     */
    public function verify(Request $request, $proofId)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $paymentProof = PaymentProof::with('order')->findOrFail($proofId);

        if ($paymentProof->status !== PaymentProof::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof has already been processed',
            ], 400);
        }

        $paymentProof->status = PaymentProof::STATUS_VERIFIED;
        $paymentProof->verified_by = Auth::id();
        $paymentProof->verified_at = now();
        $paymentProof->admin_notes = $request->admin_notes;
        $paymentProof->save();

        // Update order status to confirmed
        $order = $paymentProof->order;
        $order->status = 'confirmed';
        
        // Update payment status based on payment type
        if ($paymentProof->payment_type === PaymentProof::PAYMENT_TYPE_FULL) {
            $order->payment_status = 'paid';
        } else {
            $order->payment_status = 'dp_paid';
        }
        
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment verified and order confirmed successfully',
        ]);
    }

    /**
     * Reject payment proof (Admin only)
     */
    public function reject(Request $request, $proofId)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $paymentProof = PaymentProof::with('order')->findOrFail($proofId);

        if ($paymentProof->status !== PaymentProof::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Payment proof has already been processed',
            ], 400);
        }

        $paymentProof->status = PaymentProof::STATUS_REJECTED;
        $paymentProof->verified_by = Auth::id();
        $paymentProof->verified_at = now();
        $paymentProof->admin_notes = $request->admin_notes;
        $paymentProof->save();

        // Reactivate payment link so client can upload again
        $order = $paymentProof->order;
        $order->payment_link_active = true;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment rejected. Payment link has been reactivated.',
        ]);
    }
}
