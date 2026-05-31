<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Client;
use App\Models\Package;
use App\Services\SystemNotificationService;
use App\Services\EventScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClientOrderController extends Controller
{
    /**
     * Store a new order from client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'package_name' => 'required|string|max:255',
            'package_price' => 'required|numeric|min:0',
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email|max:255',
            'client_phone' => 'required|string|max:20',
            'event_date' => [
                'required',
                'date',
                'after:today',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (EventScheduleService::isDateFullyBooked((string) $value)) {
                        $fail('Tanggal acara sudah penuh (maksimal 3 event terkonfirmasi per hari). Silakan pilih tanggal lain.');
                    }
                },
            ],
            'event_location' => 'required|string|max:255',
            'is_venue_included' => 'nullable|boolean',
            'venue_id' => 'nullable|exists:venues,id',
            'venue_price' => 'nullable|numeric|min:0',
            'guest_count' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Get authenticated user
            $user = $request->user();
            
            // Create or update client using authenticated user's email
            $client = Client::updateOrCreate(
                ['email' => $user ? $user->email : $validated['client_email']],
                [
                    'name' => $validated['client_name'],
                    'phone' => $validated['client_phone'],
                ]
            );

            $selectedPackage = null;
            if (!empty($validated['package_id'])) {
                $selectedPackage = Package::find((int) $validated['package_id']);
            }

            // Fallback: find package by name from client side if package_id isn't sent.
            if (!$selectedPackage) {
                $selectedPackage = Package::query()
                    ->whereRaw('LOWER(name) = ?', [strtolower($validated['package_name'])])
                    ->first();
            }

            $isVenueIncluded = (bool) ($validated['is_venue_included'] ?? false);
            $venuePrice = $isVenueIncluded ? (float) ($validated['venue_price'] ?? 0) : 0;

            // Create order with status 'pending_confirmation'
            $order = Order::create([
                'client_id' => $client->id,
                'package_id' => $selectedPackage?->id,
                'event_name' => $validated['package_name'], // Required field
                'event_type' => 'wedding', // Default to wedding
                'event_date' => $validated['event_date'],
                'event_address' => $validated['event_location'], // Map to event_address
                'event_location' => $validated['event_location'],
                'is_venue_included' => $isVenueIncluded,
                'venue_id' => $isVenueIncluded ? ($validated['venue_id'] ?? null) : null,
                'venue_price' => $venuePrice,
                'event_theme' => $validated['package_name'], // Store package name as theme
                'guest_count' => $validated['guest_count'] ?? 0,
                'total_price' => $validated['package_price'],
                'discount' => 0,
                'final_price' => $validated['package_price'],
                'status' => 'pending_confirmation', // New status for orders awaiting sales confirmation
                'payment_status' => 'unpaid',
                'notes' => $validated['notes'] ?? null,
                'deposit_amount' => 0,
                'remaining_amount' => $validated['package_price'],
                'is_negotiable' => true, // Allow editing by default
                'package_details' => $selectedPackage ? [
                    'name' => $selectedPackage->name,
                    'description' => $selectedPackage->description,
                    'price' => $selectedPackage->base_price,
                    'includes_venue' => (bool) ($selectedPackage->includes_venue ?? false),
                    'venue_id' => $selectedPackage->venue_id,
                    'venue_price' => $selectedPackage->venue_price ?? 0,
                ] : [
                    'name' => $validated['package_name'],
                    'price' => $validated['package_price'],
                    'includes_venue' => $isVenueIncluded,
                    'venue_id' => $validated['venue_id'] ?? null,
                    'venue_price' => $venuePrice,
                ],
            ]);

            DB::commit();

            Log::info('New order created from client', [
                'order_id' => $order->id,
                'client_id' => $client->id,
                'package' => $validated['package_name'],
            ]);

            SystemNotificationService::orderCreated($order->fresh('client'), 'client portal');

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat! Tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi detail acara.',
                'data' => [
                    'order_id' => $order->id,
                    'order_code' => 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create order from client', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get client's orders
     */
    public function myOrders(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return Inertia::render('client/MyOrders', [
                'orders' => [],
            ]);
        }

        // Debug: Log user email
        \Log::info('MyOrders - User email: ' . $user->email);

        // Get client by user email
        $client = Client::where('email', $user->email)->first();

        // Debug: Log client lookup result
        \Log::info('MyOrders - Client found: ' . ($client ? 'Yes (ID: ' . $client->id . ')' : 'No'));

        if (!$client) {
            return Inertia::render('client/MyOrders', [
                'orders' => [],
            ]);
        }

        $ordersQuery = Order::where('client_id', $client->id)
            ->with(['client'])
            ->orderBy('created_at', 'desc');
        
        // Debug: Log query count
        \Log::info('MyOrders - Orders count: ' . $ordersQuery->count());

        $orders = $ordersQuery->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => $order->order_number ?? 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                    'event_location' => $order->event_location ?? $order->event_address,
                    'event_theme' => $order->event_theme ?? $order->event_name,
                    'guest_count' => $order->guest_count ?? 0,
                    'total_price' => $order->total_price ?? 0,
                    'final_price' => $order->final_price ?? $order->total_price,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status ?? 'unpaid',
                    'notes' => $order->notes,
                    'created_at' => $order->created_at->format('d M Y H:i'),
                ];
            });

        // Debug: Log final orders array
        \Log::info('MyOrders - Final orders count: ' . $orders->count());

        return Inertia::render('client/MyOrders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Get order detail (API)
     */
    public function show($id)
    {
        $order = Order::with(['client'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_code' => $order->order_number ?? 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'client' => [
                    'name' => $order->client->name,
                    'email' => $order->client->email,
                    'phone' => $order->client->phone,
                ],
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_location' => $order->event_location ?? $order->event_address,
                'event_theme' => $order->event_theme ?? $order->event_name,
                'guest_count' => $order->guest_count ?? 0,
                'total_price' => $order->total_price ?? 0,
                'discount' => $order->discount ?? 0,
                'final_price' => $order->final_price ?? $order->total_price,
                'total_paid' => $order->total_paid ?? 0,
                'remaining_amount' => ($order->final_price ?? 0) - ($order->total_paid ?? 0),
                'status' => $order->status,
                'payment_status' => $order->payment_status ?? 'unpaid',
                'notes' => $order->notes,
                'created_at' => $order->created_at->format('d M Y H:i'),
            ],
        ]);
    }

    /**
     * Show detailed order page for client
     */
    public function showDetail(Request $request, $id)
    {
        $user = $request->user();
        
        // Get client by user email
        $client = null;
        if ($user) {
            $client = Client::where('email', $user->email)->first();
        }
        
        // Load order with all relationships
        $order = Order::with([
            'client',
            'package',
            'paymentTransactions',
            'paymentProofs',
            'orderDetails',
            'event.rundownItems',
            'event.taskAssignments'
        ])->findOrFail($id);

        // Security check: only allow client to view their own orders
        if ($client && $order->client_id !== $client->id) {
            abort(403, 'Unauthorized access to order');
        }

        return Inertia::render('client/OrderDetail', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number ?? 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_location' => $order->event_location ?? $order->event_address,
                'event_address' => $order->event_address,
                'event_theme' => $order->event_theme,
                'guest_count' => $order->guest_count ?? 0,
                'total_price' => $order->total_price ?? 0,
                'discount' => $order->discount ?? 0,
                'final_price' => $order->final_price ?? $order->total_price,
                'dp_amount' => $order->dp_amount ?? ($order->final_price * 0.3),
                'booking_amount' => $order->booking_amount ?? 0,
                'initial_payment_type' => $order->initial_payment_type,
                'total_paid' => $order->total_paid ?? 0,
                'remaining_amount' => ($order->final_price ?? 0) - ($order->total_paid ?? 0),
                'status' => $order->status,
                'payment_status' => $order->payment_status ?? 'unpaid',
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $order->updated_at->format('Y-m-d H:i:s'),
                'client' => [
                    'name' => $order->client->name,
                    'email' => $order->client->email,
                    'phone' => $order->client->phone,
                ],
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'description' => $order->package->description,
                    'price' => $order->package->price,
                ] : null,
                'payment_transactions' => $order->paymentProofs->map(function ($proof) {
                    return [
                        'id' => $proof->id,
                        'amount' => $proof->amount,
                        'payment_type' => $proof->payment_type,
                        'payment_method' => 'transfer', // Default method
                        'payment_date' => $proof->created_at->format('Y-m-d'),
                        'status' => $proof->status,
                        'proof_url' => $proof->proof_image_path ? asset('storage/' . $proof->proof_image_path) : null,
                        'notes' => $proof->admin_notes,
                        'created_at' => $proof->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'order_details' => $order->orderDetails->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'item_type' => $detail->item_type,
                        'item_name' => $detail->item_name,
                        'quantity' => $detail->quantity,
                        'price' => $detail->price,
                        'subtotal' => $detail->subtotal,
                    ];
                }),
                'event' => $order->event ? [
                    'id' => $order->event->id,
                    'event_code' => $order->event->event_code,
                    'status' => $order->event->status,
                    'venue_name' => $order->event->venue_name,
                    'start_time' => $order->event->start_time ? $order->event->start_time->format('H:i') : null,
                    'end_time' => $order->event->end_time ? $order->event->end_time->format('H:i') : null,
                    'rundown_items' => $order->event->rundownItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'time' => $item->time,
                            'activity' => $item->activity,
                            'description' => $item->description,
                            'pic' => $item->pic,
                            'status' => $item->status,
                            'order' => $item->order,
                        ];
                    }),
                    'task_assignments' => $order->event->taskAssignments->map(function ($task) {
                        return [
                            'id' => $task->id,
                            'task_name' => $task->task_name,
                            'task_description' => $task->task_description,
                            'assigned_to' => $task->assigned_to,
                            'status' => $task->status,
                            'due_date' => $task->due_date,
                            'completed_at' => $task->completed_at,
                        ];
                    }),
                ] : null,
            ],
        ]);
    }

    /**
     * Show order detail page for admin
     */
    public function detail($id)
    {
        $order = Order::with(['client', 'package', 'paymentProofs.verifier'])
            ->findOrFail($id);

        return Inertia::render('admin/OrderDetailPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_code' => $order->order_number ?? 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'client' => [
                    'id' => $order->client->id,
                    'name' => $order->client->name,
                    'email' => $order->client->email,
                    'phone' => $order->client->phone,
                    'address' => $order->client->address ?? '-',
                ],
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_date_formatted' => $order->event_date ? $order->event_date->format('d F Y') : '-',
                'event_address' => $order->event_address,
                'event_location' => $order->event_location ?? $order->event_address,
                'event_theme' => $order->event_theme,
                'guest_count' => $order->guest_count ?? 0,
                'total_price' => $order->total_price ?? 0,
                'discount' => $order->discount ?? 0,
                'final_price' => $order->final_price ?? $order->total_price,
                'dp_amount' => $order->dp_amount ?? ($order->final_price * 0.3),
                'total_paid' => $order->total_paid ?? 0,
                'remaining_amount' => ($order->final_price ?? 0) - ($order->total_paid ?? 0),
                'status' => $order->status,
                'payment_status' => $order->payment_status ?? 'unpaid',
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'price' => $order->package->price,
                ] : null,
                'package_details' => $order->package_details,
                'custom_items' => $order->custom_items ?? [],
                'additional_costs' => $order->additional_costs ?? 0,
                'negotiation_notes' => $order->negotiation_notes,
                'is_negotiable' => $order->is_negotiable ?? true,
                'negotiated_at' => $order->negotiated_at ? $order->negotiated_at->format('d M Y H:i') : null,
                'payment_proofs' => $order->paymentProofs->map(function($proof) {
                    return [
                        'id' => $proof->id,
                        'amount' => $proof->amount,
                        'payment_type' => $proof->payment_type,
                        'proof_image_url' => $proof->proof_image_url,
                        'status' => $proof->status,
                        'verified_by' => $proof->verifier ? $proof->verifier->name : null,
                        'verified_at' => $proof->verified_at ? $proof->verified_at->format('d M Y H:i') : null,
                        'admin_notes' => $proof->admin_notes,
                        'created_at' => $proof->created_at->format('d M Y H:i'),
                    ];
                }),
                'payment_link_active' => $order->payment_link_active ?? false,
                'payment_link_expires_at' => $order->payment_link_expires_at ? $order->payment_link_expires_at->format('d M Y H:i') : null,
                'created_at' => $order->created_at->format('d M Y H:i'),
                'updated_at' => $order->updated_at->format('d M Y H:i'),
            ],
        ]);
    }

    /**
     * Confirm order - mark as ready to process (Admin only)
     */
    public function confirmOrder($id)
    {
        $order = Order::with('paymentProofs')->findOrFail($id);

        // Check if order is already confirmed or beyond
        if (in_array($order->status, [Order::STATUS_CONFIRMED, Order::STATUS_PROCESSING, Order::STATUS_COMPLETED])) {
            return response()->json([
                'success' => false,
                'message' => 'Order has already been confirmed',
            ], 400);
        }

        // Check if payment is complete (either full payment or DP paid)
        $hasFullPayment = $order->paymentProofs()
            ->where('payment_type', 'full')
            ->where('status', 'verified')
            ->exists();

        $hasDpPayment = $order->paymentProofs()
            ->where('payment_type', 'dp')
            ->where('status', 'verified')
            ->exists();

        $hasBookingPayment = $order->paymentProofs()
            ->where('payment_type', 'booking')
            ->where('status', 'verified')
            ->exists();

        if (!$hasFullPayment && !$hasDpPayment && !$hasBookingPayment) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot confirm order. Waiting for booking, DP, or full payment to be verified first.',
            ], 400);
        }

        // DP amount can be any verified value per agreement.

        $previousStatus = $order->status;

        // Update order status
        $order->status = Order::STATUS_CONFIRMED;
        $order->save();

        SystemNotificationService::orderStatusUpdated($order, $previousStatus);

        return response()->json([
            'success' => true,
            'message' => 'Order confirmed successfully. Order is now ready to be processed.',
        ]);
    }

    /**
     * Update order status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', [
                Order::STATUS_PROCESSING,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ]),
            'notes' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);

        // Validate status transition
        if ($request->status === Order::STATUS_PROCESSING && $order->status !== Order::STATUS_CONFIRMED) {
            return response()->json([
                'success' => false,
                'message' => 'Order must be confirmed first before processing',
            ], 400);
        }

        if ($request->status === Order::STATUS_COMPLETED && $order->status !== Order::STATUS_PROCESSING) {
            return response()->json([
                'success' => false,
                'message' => 'Order must be in processing status before completion',
            ], 400);
        }

        $previousStatus = $order->status;

        $order->status = $request->status;
        if ($request->notes) {
            $order->notes = ($order->notes ? $order->notes . "\n\n" : '') . 
                            "[" . now()->format('d M Y H:i') . "] " . $request->notes;
        }
        $order->save();

        SystemNotificationService::orderStatusUpdated($order, $previousStatus);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
        ]);
    }
}
