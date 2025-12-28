<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderNegotiationController extends Controller
{
    public function edit($id)
    {
        $order = Order::with(['client', 'package'])->findOrFail($id);
        $packages = Package::all();

        return Inertia::render('admin/orders/EditOrderPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'client' => [
                    'id' => $order->client->id,
                    'name' => $order->client->name,
                    'email' => $order->client->email,
                    'phone' => $order->client->phone,
                ],
                'package_id' => $order->package_id,
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'price' => $order->package->price,
                    'description' => $order->package->description,
                ] : null,
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_address' => $order->event_address,
                'event_location' => $order->event_location,
                'event_theme' => $order->event_theme,
                'guest_count' => $order->guest_count,
                'total_price' => $order->total_price,
                'discount' => $order->discount,
                'final_price' => $order->final_price,
                'dp_amount' => $order->dp_amount,
                'additional_costs' => $order->additional_costs ?? 0,
                'package_details' => $order->package_details ?? [],
                'custom_items' => $order->custom_items ?? [],
                'negotiation_notes' => $order->negotiation_notes,
                'is_negotiable' => $order->is_negotiable,
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'status' => $order->status,
            ],
            'packages' => $packages->map(function($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'description' => $package->description,
                ];
            })
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:255',
            'event_date' => 'required|date',
            'event_address' => 'nullable|string|max:500',
            'event_location' => 'required|string|max:255',
            'event_theme' => 'nullable|string|max:255',
            'guest_count' => 'nullable|integer|min:0',
            'additional_costs' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'custom_items' => 'nullable|array',
            'negotiation_notes' => 'nullable|string|max:2000',
        ]);

        // Get package for price calculation
        $packagePrice = 0;
        if (!empty($validated['package_id'])) {
            $package = Package::find($validated['package_id']);
            if ($package) {
                $packagePrice = $package->price;
                // Store package details snapshot
                $validated['package_details'] = [
                    'name' => $package->name,
                    'description' => $package->description,
                    'price' => $package->price,
                ];
            }
        }

        // Calculate total price from package + custom items + additional costs
        $totalPrice = $packagePrice;
        
        // Add custom items
        if (!empty($validated['custom_items'])) {
            foreach ($validated['custom_items'] as $item) {
                if (!empty($item['name']) && !empty($item['price']) && !empty($item['quantity'])) {
                    $totalPrice += floatval($item['price']) * intval($item['quantity']);
                }
            }
        }

        // Add additional costs
        if (!empty($validated['additional_costs'])) {
            $totalPrice += floatval($validated['additional_costs']);
        }

        // Calculate final price after discount
        $discount = floatval($validated['discount'] ?? 0);
        $finalPrice = max(0, $totalPrice - $discount);
        
        // Calculate DP (30%) and remaining
        $dpAmount = $finalPrice * 0.3;
        $remainingAmount = $finalPrice - $dpAmount;

        // Update order
        $order->update([
            'package_id' => $validated['package_id'],
            'event_name' => $validated['event_name'],
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_address' => $validated['event_address'] ?? $validated['event_location'],
            'event_location' => $validated['event_location'],
            'event_theme' => $validated['event_theme'],
            'guest_count' => $validated['guest_count'] ?? 0,
            'additional_costs' => $validated['additional_costs'] ?? 0,
            'discount' => $discount,
            'total_price' => round($totalPrice, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
            'deposit_amount' => 0, // Will be updated when payment verified
            'custom_items' => $validated['custom_items'] ?? [],
            'package_details' => $validated['package_details'] ?? [],
            'negotiation_notes' => $validated['negotiation_notes'],
            'is_negotiable' => false,
            'negotiated_at' => now(),
        ]);

        return redirect()->route('admin.orders.detail', $order->id)
            ->with('success', 'Order berhasil diupdate dan difinalisasi');
    }

    public function recalculate(Request $request, $id)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'custom_items' => 'nullable|array',
            'custom_items.*.name' => 'nullable|string',
            'custom_items.*.price' => 'nullable|numeric|min:0',
            'custom_items.*.quantity' => 'nullable|integer|min:0',
            'discount' => 'nullable|numeric|min:0',
            'additional_costs' => 'nullable|numeric|min:0',
        ]);

        $totalPrice = 0;

        // Add package price
        if (!empty($validated['package_id'])) {
            $package = Package::find($validated['package_id']);
            if ($package) {
                $totalPrice += $package->price;
            }
        }

        // Add custom items
        if (!empty($validated['custom_items'])) {
            foreach ($validated['custom_items'] as $item) {
                // Skip items with empty or zero values
                if (empty($item['name']) || empty($item['price']) || empty($item['quantity'])) {
                    continue;
                }
                $totalPrice += floatval($item['price']) * intval($item['quantity']);
            }
        }

        // Add additional costs
        if (!empty($validated['additional_costs'])) {
            $totalPrice += floatval($validated['additional_costs']);
        }

        // Apply discount
        $discount = floatval($validated['discount'] ?? 0);
        $finalPrice = max(0, $totalPrice - $discount);

        // Calculate DP (30%)
        $dpAmount = $finalPrice * 0.3;

        return response()->json([
            'total_price' => round($totalPrice, 2),
            'discount' => round($discount, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($finalPrice - $dpAmount, 2),
        ]);
    }
}
