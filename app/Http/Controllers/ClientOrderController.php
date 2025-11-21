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

            // Create or update client
            $client = Client::updateOrCreate(
                ['email' => $validated['client_email']],
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
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Get client by user email
        $client = Client::where('email', $user->email)->first();

        if (!$client) {
            return Inertia::render('client/MyOrders', [
                'orders' => [],
            ]);
        }

        $orders = Order::where('client_id', $client->id)
            ->with(['client'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_code' => 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'event_date' => $order->event_date,
                    'event_location' => $order->event_location,
                    'event_theme' => $order->event_theme,
                    'guest_count' => $order->guest_count,
                    'total_price' => $order->total_price,
                    'final_price' => $order->final_price,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('client/MyOrders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Get order detail
     */
    public function show($id)
    {
        $order = Order::with(['client'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_code' => 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'client' => [
                    'name' => $order->client->name,
                    'email' => $order->client->email,
                    'phone' => $order->client->phone,
                ],
                'event_date' => $order->event_date,
                'event_location' => $order->event_location,
                'event_theme' => $order->event_theme,
                'guest_count' => $order->guest_count,
                'total_price' => $order->total_price,
                'discount' => $order->discount,
                'final_price' => $order->final_price,
                'deposit_amount' => $order->deposit_amount,
                'remaining_amount' => $order->remaining_amount,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'notes' => $order->notes,
                'created_at' => $order->created_at->format('d M Y H:i'),
            ],
        ]);
    }
}
