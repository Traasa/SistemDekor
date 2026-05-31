<?php

namespace App\Http\Controllers;

use App\Models\MiniOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MiniOrderNegotiationController extends Controller
{
    private function resolveDpAmount(float $finalPrice, string $dpType, float $dpValue): float
    {
        if ($finalPrice <= 0) {
            return 0;
        }

        if ($dpType === 'amount') {
            return min(max($dpValue, 0), $finalPrice);
        }

        $percent = min(max($dpValue, 0), 100);
        return ($finalPrice * $percent) / 100;
    }

    public function edit($id)
    {
        $order = MiniOrder::with(['vendorClient', 'orderDetails', 'images'])->findOrFail($id);

        return Inertia::render('admin/mini-orders/EditMiniOrderPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'vendor_client' => [
                    'id' => $order->vendorClient?->id,
                    'name' => $order->vendorClient?->name,
                    'company_name' => $order->vendorClient?->company_name,
                    'email' => $order->vendorClient?->email,
                    'phone' => $order->vendorClient?->phone,
                    'address' => $order->vendorClient?->address,
                ],
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_address' => $order->event_address,
                'event_location' => $order->event_location,
                'total_price' => $order->total_price,
                'discount' => $order->discount,
                'final_price' => $order->final_price,
                'dp_amount' => $order->dp_amount,
                'booking_amount' => $order->booking_amount,
                'initial_payment_type' => $order->initial_payment_type,
                'remaining_amount' => $order->remaining_amount,
                'additional_costs' => $order->additional_costs ?? 0,
                'custom_items' => $order->custom_items ?? [],
                'negotiation_notes' => $order->negotiation_notes,
                'is_negotiable' => $order->is_negotiable,
                'images' => $order->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => $image->image_url,
                    ];
                }),
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'status' => $order->status,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = MiniOrder::findOrFail($id);

        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:255',
            'event_date' => 'required|date',
            'event_address' => 'required|string|max:500',
            'event_location' => 'required|string|max:255',
            'additional_costs' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'custom_items' => 'nullable|array',
            'negotiation_notes' => 'nullable|string|max:2000',
            'dp_type' => 'nullable|in:percent,amount',
            'dp_value' => 'nullable|numeric|min:0',
            'initial_payment_type' => 'nullable|in:dp',
            'booking_amount' => 'nullable|numeric|min:0',
        ]);

        $totalPrice = 0;

        if (!empty($validated['custom_items'])) {
            foreach ($validated['custom_items'] as $item) {
                if (!empty($item['name']) && !empty($item['price']) && !empty($item['quantity'])) {
                    $totalPrice += floatval($item['price']) * intval($item['quantity']);
                }
            }
        }

        if (!empty($validated['additional_costs'])) {
            $totalPrice += floatval($validated['additional_costs']);
        }

        $discount = floatval($validated['discount'] ?? 0);
        $finalPrice = max(0, $totalPrice - $discount);

        $dpType = $validated['dp_type'] ?? 'percent';
        $dpValue = floatval($validated['dp_value'] ?? 30);
        $dpAmount = $this->resolveDpAmount($finalPrice, $dpType, $dpValue);
        $remainingAmount = $finalPrice - $dpAmount;
        $initialPaymentType = $validated['initial_payment_type'] ?? $order->initial_payment_type ?? 'dp';
        $bookingAmount = 0;

        $order->update([
            'event_name' => $validated['event_name'],
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_address' => $validated['event_address'],
            'event_location' => $validated['event_location'],
            'additional_costs' => $validated['additional_costs'] ?? 0,
            'discount' => $discount,
            'total_price' => round($totalPrice, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
            'booking_amount' => round($bookingAmount, 2),
            'custom_items' => $validated['custom_items'] ?? [],
            'negotiation_notes' => $validated['negotiation_notes'],
            'is_negotiable' => false,
            'negotiated_at' => now(),
            'initial_payment_type' => $initialPaymentType,
        ]);

        return redirect()->route('admin.mini-orders.detail', $order->id)
            ->with('success', 'Mini order berhasil diupdate dan difinalisasi');
    }

    public function recalculate(Request $request, $id)
    {
        $validated = $request->validate([
            'custom_items' => 'nullable|array',
            'custom_items.*.name' => 'nullable|string',
            'custom_items.*.price' => 'nullable|numeric|min:0',
            'custom_items.*.quantity' => 'nullable|integer|min:0',
            'discount' => 'nullable|numeric|min:0',
            'additional_costs' => 'nullable|numeric|min:0',
            'initial_payment_type' => 'nullable|in:dp',
            'booking_amount' => 'nullable|numeric|min:0',
            'dp_type' => 'nullable|in:percent,amount',
            'dp_value' => 'nullable|numeric|min:0',
        ]);

        $totalPrice = 0;

        if (!empty($validated['custom_items'])) {
            foreach ($validated['custom_items'] as $item) {
                if (empty($item['name']) || empty($item['price']) || empty($item['quantity'])) {
                    continue;
                }
                $totalPrice += floatval($item['price']) * intval($item['quantity']);
            }
        }

        if (!empty($validated['additional_costs'])) {
            $totalPrice += floatval($validated['additional_costs']);
        }

        $discount = floatval($validated['discount'] ?? 0);
        $finalPrice = max(0, $totalPrice - $discount);

        $dpType = $validated['dp_type'] ?? 'percent';
        $dpValue = floatval($validated['dp_value'] ?? 30);
        $dpAmount = $this->resolveDpAmount($finalPrice, $dpType, $dpValue);
        $remainingAmount = $finalPrice - $dpAmount;

        return response()->json([
            'total_price' => round($totalPrice, 2),
            'discount' => round($discount, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
        ]);
    }
}
