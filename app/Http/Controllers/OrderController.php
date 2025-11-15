<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Client;
use App\Models\Package;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['client', 'package', 'user'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Search by client name
        if ($request->has('search') && $request->search != '') {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $orders = $query->paginate(15);

        return Inertia::render('Dashboard/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clients = Client::orderBy('name')->get();
        $packages = Package::where('is_active', true)->get();

        return Inertia::render('Dashboard/Orders/Create', [
            'clients' => $clients,
            'packages' => $packages,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'required_if:client_id,null|string|max:255',
            'client_phone' => 'required_if:client_id,null|string|max:20',
            'client_email' => 'nullable|email|max:255',
            'client_address' => 'nullable|string',
            'package_id' => 'nullable|exists:packages,id',
            'event_date' => 'required|date',
            'event_address' => 'required|string',
            'total_price' => 'required|numeric|min:0',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
            'order_details' => 'nullable|array',
            'order_details.*.item_name' => 'required|string|max:255',
            'order_details.*.item_description' => 'nullable|string',
            'order_details.*.cost' => 'required|numeric|min:0',
            'order_details.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Create or get client
            if ($request->client_id) {
                $clientId = $request->client_id;
            } else {
                $client = Client::create([
                    'name' => $request->client_name,
                    'phone' => $request->client_phone,
                    'email' => $request->client_email,
                    'address' => $request->client_address,
                ]);
                $clientId = $client->id;
            }

            // Create order with verification token
            $order = Order::create([
                'client_id' => $clientId,
                'package_id' => $request->package_id,
                'user_id' => auth()->id(),
                'event_date' => $request->event_date,
                'event_address' => $request->event_address,
                'total_price' => $request->total_price,
                'status' => $request->status,
                'verification_token' => Str::random(64),
                'notes' => $request->notes,
            ]);

            // Create order details if provided
            if ($request->has('order_details') && is_array($request->order_details)) {
                foreach ($request->order_details as $detail) {
                    OrderDetail::create([
                        'order_id' => $order->id,
                        'item_name' => $detail['item_name'],
                        'item_description' => $detail['item_description'] ?? null,
                        'cost' => $detail['cost'],
                        'quantity' => $detail['quantity'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('orders.show', $order)
                ->with('success', 'Order berhasil dibuat! Link verifikasi: ' . route('client.verification', $order->verification_token));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat order: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['client', 'package', 'user', 'orderDetails', 'paymentTransactions']);

        $verificationLink = route('client.verification', $order->verification_token);

        return Inertia::render('Dashboard/Orders/Show', [
            'order' => $order,
            'verificationLink' => $verificationLink,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        $order->load(['client', 'orderDetails']);
        $clients = Client::orderBy('name')->get();
        $packages = Package::where('is_active', true)->get();

        return Inertia::render('Dashboard/Orders/Edit', [
            'order' => $order,
            'clients' => $clients,
            'packages' => $packages,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'event_date' => 'required|date',
            'event_address' => 'required|string',
            'total_price' => 'required|numeric|min:0',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
            'order_details' => 'nullable|array',
            'order_details.*.id' => 'nullable|exists:order_details,id',
            'order_details.*.item_name' => 'required|string|max:255',
            'order_details.*.item_description' => 'nullable|string',
            'order_details.*.cost' => 'required|numeric|min:0',
            'order_details.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $order->update([
                'package_id' => $request->package_id,
                'event_date' => $request->event_date,
                'event_address' => $request->event_address,
                'total_price' => $request->total_price,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            // Update order details
            if ($request->has('order_details')) {
                // Delete old details that are not in the new list
                $newDetailIds = collect($request->order_details)
                    ->pluck('id')
                    ->filter();

                $order->orderDetails()
                    ->whereNotIn('id', $newDetailIds)
                    ->delete();

                // Update or create details
                foreach ($request->order_details as $detail) {
                    if (isset($detail['id'])) {
                        OrderDetail::where('id', $detail['id'])
                            ->update([
                                'item_name' => $detail['item_name'],
                                'item_description' => $detail['item_description'] ?? null,
                                'cost' => $detail['cost'],
                                'quantity' => $detail['quantity'],
                            ]);
                    } else {
                        OrderDetail::create([
                            'order_id' => $order->id,
                            'item_name' => $detail['item_name'],
                            'item_description' => $detail['item_description'] ?? null,
                            'cost' => $detail['cost'],
                            'quantity' => $detail['quantity'],
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('orders.show', $order)
                ->with('success', 'Order berhasil diupdate!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengupdate order: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        try {
            $order->delete();
            return redirect()->route('orders.index')
                ->with('success', 'Order berhasil dihapus!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus order: ' . $e->getMessage()]);
        }
    }
}
