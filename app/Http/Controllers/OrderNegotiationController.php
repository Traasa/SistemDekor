<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Package;
use App\Models\Venue;
use App\Services\EventScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderNegotiationController extends Controller
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
        $order = Order::with(['client', 'package', 'venue'])->findOrFail($id);
        $packages = Package::all();
        $venues = Venue::with('pricing')->active()->orderBy('name')->get();

        return Inertia::render('admin/orders/EditOrderPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'client_name' => $order->client?->name,
                'client' => [
                    'id' => $order->client?->id,
                    'name' => $order->client?->name,
                    'email' => $order->client?->email,
                    'phone' => $order->client?->phone,
                ],
                'package_id' => $order->package_id,
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'price' => $order->package->base_price,
                    'description' => $order->package->description,
                ] : null,
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_address' => $order->event_address,
                'event_location' => $order->event_location,
                'is_venue_included' => (bool) $order->is_venue_included,
                'venue_id' => $order->venue_id,
                'venue_price' => $order->venue_price ?? 0,
                'event_theme' => $order->event_theme,
                'guest_count' => $order->guest_count,
                'total_price' => $order->total_price,
                'discount' => $order->discount,
                'final_price' => $order->final_price,
                'dp_amount' => $order->dp_amount,
                'booking_amount' => $order->booking_amount,
                'initial_payment_type' => $order->initial_payment_type,
                'remaining_amount' => $order->remaining_amount,
                'additional_costs' => $order->additional_costs ?? 0,
                'package_details' => $order->package_details ?? [],
                'custom_items' => $order->custom_items ?? [],
                'negotiation_notes' => $order->negotiation_notes,
                'is_negotiable' => $order->is_negotiable,
                'notes' => $order->notes,
                'special_requests' => $order->special_requests,
                'status' => $order->status,
            ],
            'packages' => $packages->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->base_price,
                    'description' => $package->description,
                    'includes_venue' => (bool) $package->includes_venue,
                    'venue_id' => $package->venue_id,
                    'venue_price' => $package->venue_price ?? 0,
                ];
            }),
            'venues' => $venues->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'city' => $venue->city,
                    'pricing' => $venue->pricing ? $venue->pricing->where('is_active', true)->map(function ($p) {
                        return [
                            'id' => $p->id,
                            'day_type' => $p->day_type,
                            'session_type' => $p->session_type,
                            'base_price' => $p->base_price,
                        ];
                    })->values() : [],
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'event_name' => 'required|string|max:255',
            'event_type' => 'required|string|max:255',
            'event_date' => [
                'required',
                'date',
                function (string $attribute, mixed $value, \Closure $fail) use ($order) {
                    if (EventScheduleService::isDateFullyBooked((string) $value, $order->id)) {
                        $fail('Tanggal acara sudah penuh (maksimal 1 event terkonfirmasi per hari).');
                    }
                },
            ],
            'event_address' => 'nullable|string|max:500',
            'event_location' => 'required|string|max:255',
            'is_venue_included' => 'nullable|boolean',
            'venue_id' => 'nullable|exists:venues,id',
            'venue_price' => 'nullable|numeric|min:0',
            'event_theme' => 'nullable|string|max:255',
            'guest_count' => 'nullable|integer|min:0',
            'additional_costs' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'custom_items' => 'nullable|array',
            'negotiation_notes' => 'nullable|string|max:2000',
            'dp_type' => 'nullable|in:percent,amount',
            'dp_value' => 'nullable|numeric|min:0',
            'initial_payment_type' => 'nullable|in:booking,dp',
            'booking_amount' => 'nullable|numeric|min:0',
        ]);

        $packagePrice = 0;

        if ($order->package_id && !empty($validated['package_id']) && (int) $validated['package_id'] !== (int) $order->package_id) {
            return back()->withErrors([
                'package_id' => 'Paket sudah dipilih oleh client dan tidak dapat diubah.',
            ]);
        }

        if ($order->package_id && empty($validated['package_id'])) {
            $validated['package_id'] = $order->package_id;
        }

        if (!empty($validated['package_id'])) {
            $package = Package::find($validated['package_id']);
            if ($package) {
                $packagePrice = $package->base_price;
                $validated['package_details'] = [
                    'name' => $package->name,
                    'description' => $package->description,
                    'price' => $package->base_price,
                ];
            }
        }

        $totalPrice = $packagePrice;

        $isVenueIncluded = (bool) ($validated['is_venue_included'] ?? false);
        $venuePrice = $isVenueIncluded ? floatval($validated['venue_price'] ?? 0) : 0;

        if ($isVenueIncluded) {
            $totalPrice += $venuePrice;
        }

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

        $initialPaymentType = $validated['initial_payment_type'] ?? $order->initial_payment_type ?? 'booking';
        
        if ($initialPaymentType === 'booking') {
            $bookingAmount = floatval($validated['booking_amount'] ?? $order->booking_amount ?? 0);
        } else {
            $bookingAmount = 0;
        }
        
        $remainingAmount = max(0, $finalPrice - $dpAmount - $bookingAmount);

        $order->update([
            'package_id' => $validated['package_id'],
            'event_name' => $validated['event_name'],
            'event_type' => $validated['event_type'],
            'event_date' => $validated['event_date'],
            'event_address' => $validated['event_address'] ?? $validated['event_location'],
            'event_location' => $validated['event_location'],
            'is_venue_included' => $isVenueIncluded,
            'venue_id' => $isVenueIncluded ? ($validated['venue_id'] ?? null) : null,
            'venue_price' => round($venuePrice, 2),
            'event_theme' => $validated['event_theme'],
            'guest_count' => $validated['guest_count'] ?? 0,
            'additional_costs' => $validated['additional_costs'] ?? 0,
            'discount' => $discount,
            'total_price' => round($totalPrice, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
            'booking_amount' => round($bookingAmount, 2),
            'deposit_amount' => 0,
            'custom_items' => $validated['custom_items'] ?? [],
            'package_details' => $validated['package_details'] ?? [],
            'negotiation_notes' => $validated['negotiation_notes'],
            'is_negotiable' => false,
            'negotiated_at' => now(),
            'initial_payment_type' => $initialPaymentType,
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
            'is_venue_included' => 'nullable|boolean',
            'venue_id' => 'nullable|exists:venues,id',
            'venue_price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'additional_costs' => 'nullable|numeric|min:0',
            'initial_payment_type' => 'nullable|in:booking,dp',
            'booking_amount' => 'nullable|numeric|min:0',
            'dp_type' => 'nullable|in:percent,amount',
            'dp_value' => 'nullable|numeric|min:0',
        ]);

        $totalPrice = 0;

        if (!empty($validated['package_id'])) {
            $package = Package::find($validated['package_id']);
            if ($package) {
                $totalPrice += $package->base_price;
            }
        }

        $isVenueIncluded = (bool) ($validated['is_venue_included'] ?? false);
        if ($isVenueIncluded) {
            $totalPrice += floatval($validated['venue_price'] ?? 0);
        }

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

        $initialPaymentType = $validated['initial_payment_type'] ?? 'booking';
        
        if ($initialPaymentType === 'booking') {
            $bookingAmount = floatval($validated['booking_amount'] ?? 0);
        } else {
            $bookingAmount = 0;
        }

        $remainingAmount = max(0, $finalPrice - $dpAmount - $bookingAmount);

        return response()->json([
            'total_price' => round($totalPrice, 2),
            'discount' => round($discount, 2),
            'final_price' => round($finalPrice, 2),
            'dp_amount' => round($dpAmount, 2),
            'booking_amount' => round($bookingAmount, 2),
            'remaining_amount' => round($remainingAmount, 2),
        ]);
    }
}
