<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Client;
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
            'package_name' => 'required|string|max:255',
            'package_price' => 'required|numeric|min:0',
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email|max:255',
            'client_phone' => 'required|string|max:20',
            'event_date' => 'required|date|after:today',
            'event_location' => 'required|string|max:255',
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

            // Create order with status 'pending_confirmation'
            $order = Order::create([
                'client_id' => $client->id,
                'event_name' => $validated['package_name'], // Required field
                'event_type' => 'wedding', // Default to wedding
                'event_date' => $validated['event_date'],
                'event_address' => $validated['event_location'], // Map to event_address
                'event_location' => $validated['event_location'],
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
            ]);

            DB::commit();

            Log::info('New order created from client', [
                'order_id' => $order->id,
                'client_id' => $client->id,
                'package' => $validated['package_name'],
            ]);

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
                'deposit_amount' => $order->deposit_amount ?? 0,
                'remaining_amount' => $order->remaining_amount ?? $order->total_price,
                'status' => $order->status,
                'payment_status' => $order->payment_status ?? 'unpaid',
                'notes' => $order->notes,
                'created_at' => $order->created_at->format('d M Y H:i'),
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
                'dp_amount' => $order->dp_amount ?? 0,
                'deposit_amount' => $order->deposit_amount ?? 0,
                'remaining_amount' => $order->remaining_amount ?? $order->total_price,
                'status' => $order->status,
                'payment_status' => $order->payment_status ?? 'unpaid',
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'price' => $order->package->price,
                ] : null,
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
}
