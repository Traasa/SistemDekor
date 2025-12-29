<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Get all payment proofs (Admin only)
     */
    public function index(Request $request)
    {
        $query = PaymentProof::with(['order.client'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('order', function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $paymentProofs = $query->paginate(15);

        // Transform data to include all necessary fields
        $paymentProofs->getCollection()->transform(function ($proof) {
            return [
                'id' => $proof->id,
                'order_id' => $proof->order_id,
                'order' => [
                    'id' => $proof->order->id,
                    'order_number' => $proof->order->order_number,
                    'client' => [
                        'name' => $proof->order->client->name,
                    ],
                    'final_price' => (float) $proof->order->final_price,
                    'deposit_amount' => (float) $proof->order->deposit_amount,
                    'payment_status' => $proof->order->payment_status,
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

    /**
     * Generate payment link for an order (Admin only)
     */
    public function generateLink(Request $request, $orderId)
    {
        $request->validate([
            'hours_valid' => 'nullable|integer|min:1|max:168', // max 7 days
            'payment_type' => 'nullable|in:dp,full', // Specify which payment type
        ]);

        $order = Order::with(['client', 'package'])->findOrFail($orderId);

        // Check if order is still negotiable
        if ($order->is_negotiable) {
            return response()->json([
                'success' => false,
                'message' => 'Order is still under negotiation. Please finalize the order first before generating payment link.',
            ], 400);
        }

        // Determine payment type automatically if not specified
        $paymentType = $request->input('payment_type');
        if (!$paymentType) {
            // Auto-determine based on current status
            if ($order->payment_status === Order::PAYMENT_UNPAID || 
                $order->payment_status === Order::PAYMENT_DP_PENDING) {
                $paymentType = 'dp';
            } elseif ($order->payment_status === Order::PAYMENT_DP_PAID || 
                      $order->payment_status === Order::PAYMENT_FULL_PENDING) {
                $paymentType = 'full';
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Order payment status is not eligible for payment link generation.',
                ], 400);
            }
        }

        // Check if already has active payment link for this payment type
        if ($order->payment_link_active && 
            !$order->isPaymentLinkExpired() && 
            $order->payment_link_type === $paymentType) {
            return response()->json([
                'success' => false,
                'message' => 'Order already has an active payment link for ' . strtoupper($paymentType),
                'link' => route('payment.show', ['token' => $order->payment_link_token]),
                'payment_type' => $paymentType,
            ], 400);
        }

        $hoursValid = $request->input('hours_valid', 48); // Default 48 hours
        $paymentLink = $order->generatePaymentLink($hoursValid, $paymentType);

        // Update payment status
        if ($paymentType === 'dp') {
            $order->payment_status = Order::PAYMENT_DP_PENDING;
        } else {
            $order->payment_status = Order::PAYMENT_FULL_PENDING;
        }
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment link generated successfully for ' . strtoupper($paymentType),
            'link' => $paymentLink,
            'payment_type' => $paymentType,
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
                'deposit_amount' => $order->deposit_amount ?? 0,
                'remaining_amount' => $order->remaining_amount ?? $order->final_price ?? 0,
                'payment_link_type' => $order->payment_link_type ?? 'dp',
                'payment_status' => $order->payment_status,
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

        // Validate payment type matches the link type
        if ($order->payment_link_type && $request->payment_type !== $order->payment_link_type) {
            return response()->json([
                'success' => false,
                'message' => 'Payment type mismatch. This link is for ' . strtoupper($order->payment_link_type) . ' payment only.',
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

        // Update order status based on payment type
        $order = $paymentProof->order;
        
        if ($paymentProof->payment_type === PaymentProof::PAYMENT_TYPE_FULL) {
            // Full payment verified
            $order->payment_status = Order::PAYMENT_PAID;
            $order->status = Order::STATUS_PAID;
            $order->deposit_amount = $paymentProof->amount;
            $order->remaining_amount = 0;
            
            // Automatically create event when order is fully paid
            $this->createEventFromOrder($order);
        } else {
            // DP payment verified
            $order->payment_status = Order::PAYMENT_DP_PAID;
            $order->status = Order::STATUS_DP_PAID;
            $order->deposit_amount = $paymentProof->amount;
            $order->remaining_amount = $order->final_price - $paymentProof->amount;
        }
        
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
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
    
    /**
     * Create event automatically from order
     */
    private function createEventFromOrder(Order $order)
    {
        // Check if event already exists
        if ($order->event()->exists()) {
            return;
        }
        
        // Create event
        Event::create([
            'order_id' => $order->id,
            'client_id' => $order->client_id,
            'event_name' => $order->event_name ?? 'Event ' . $order->order_number,
            'event_type' => $this->mapEventType($order->event_type),
            'event_date' => $order->event_date,
            'start_time' => $order->event_date ? $order->event_date . ' 08:00:00' : now()->addDays(7) . ' 08:00:00',
            'end_time' => $order->event_date ? $order->event_date . ' 22:00:00' : now()->addDays(7) . ' 22:00:00',
            'venue_name' => $order->event_location ?? 'TBD',
            'venue_address' => $order->event_address ?? 'TBD',
            'guest_count' => $order->guest_count,
            'status' => 'confirmed',
            'notes' => 'Event otomatis dibuat dari Order: ' . $order->order_number,
            'contact_persons' => [
                [
                    'name' => $order->client->name,
                    'phone' => $order->client->phone,
                    'role' => 'Client'
                ]
            ],
        ]);
    }
    
    /**
     * Map order event type to event model event type
     */
    private function mapEventType($orderEventType)
    {
        $mapping = [
            'pernikahan' => 'wedding',
            'ulang_tahun' => 'birthday',
            'corporate' => 'corporate',
            'lamaran' => 'engagement',
            'anniversary' => 'anniversary',
            'wisuda' => 'graduation',
        ];
        
        return $mapping[strtolower($orderEventType)] ?? 'other';
    }
}
