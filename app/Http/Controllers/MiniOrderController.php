<?php

namespace App\Http\Controllers;

use App\Models\MiniOrder;
use Inertia\Inertia;

class MiniOrderController extends Controller
{
    public function detail($id)
    {
        $order = MiniOrder::with(['vendorClient', 'paymentProofs.verifier', 'orderDetails', 'images'])
            ->findOrFail($id);

        return Inertia::render('admin/MiniOrderDetailPage', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_code' => $order->order_number,
                'vendor_client' => [
                    'id' => $order->vendorClient->id,
                    'name' => $order->vendorClient->name,
                    'company_name' => $order->vendorClient->company_name,
                    'email' => $order->vendorClient->email,
                    'phone' => $order->vendorClient->phone,
                    'address' => $order->vendorClient->address ?? '-',
                ],
                'event_name' => $order->event_name,
                'event_type' => $order->event_type,
                'event_date' => $order->event_date ? $order->event_date->format('Y-m-d') : null,
                'event_date_formatted' => $order->event_date ? $order->event_date->format('d F Y') : '-',
                'event_address' => $order->event_address,
                'event_location' => $order->event_location ?? $order->event_address,
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
                'custom_items' => $order->custom_items ?? [],
                'additional_costs' => $order->additional_costs ?? 0,
                'negotiation_notes' => $order->negotiation_notes,
                'is_negotiable' => $order->is_negotiable ?? true,
                'negotiated_at' => $order->negotiated_at ? $order->negotiated_at->format('d M Y H:i') : null,
                'payment_proofs' => $order->paymentProofs->map(function ($proof) {
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
                'images' => $order->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => $image->image_url,
                    ];
                }),
                'created_at' => $order->created_at->format('d M Y H:i'),
                'updated_at' => $order->updated_at->format('d M Y H:i'),
            ],
        ]);
    }
}
