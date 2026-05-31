<?php

namespace App\Http\Controllers;

use App\Models\MiniOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;

class MiniOrderDocumentController extends Controller
{
    public function downloadInvoiceAdmin(int $id)
    {
        $miniOrder = MiniOrder::with(['vendorClient', 'paymentProofs'])->findOrFail($id);

        $order = (object) [
            'id' => $miniOrder->id,
            'order_number' => $miniOrder->order_number,
            'created_at' => $miniOrder->created_at,
            'client' => (object) [
                'name' => $miniOrder->vendorClient?->name ?? '-',
                'email' => $miniOrder->vendorClient?->email ?? '-',
                'phone' => $miniOrder->vendorClient?->phone ?? '-',
            ],
            'event_name' => $miniOrder->event_name,
            'event_date' => $miniOrder->event_date,
            'event_location' => $miniOrder->event_location,
            'event_address' => $miniOrder->event_address,
            'package' => (object) [
                'name' => 'Mini Order',
                'base_price' => null,
            ],
            'orderDetails' => $this->mapOrderDetails($miniOrder),
            'total_price' => $miniOrder->total_price,
            'discount' => $miniOrder->discount,
            'final_price' => $miniOrder->final_price,
            'paymentProofs' => $miniOrder->paymentProofs,
            'total_paid' => $miniOrder->total_paid,
            'remaining_payment' => $miniOrder->remaining_payment,
        ];

        $pdf = Pdf::loadView('pdf.order-invoice', ['order' => $order]);
        return $pdf->download('Invoice-' . ($miniOrder->order_number ?? ('MINI-' . $miniOrder->id)) . '.pdf');
    }

    private function mapOrderDetails(MiniOrder $miniOrder): Collection
    {
        $items = collect($miniOrder->custom_items ?? []);

        return $items->map(function ($item) {
            $price = (float) ($item['price'] ?? $item['cost'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 1);
            $subtotal = $price * $quantity;

            return (object) [
                'item_name' => $item['name'] ?? $item['item_name'] ?? 'Item',
                'quantity' => $quantity,
                'cost' => $price,
                'subtotal' => $subtotal,
            ];
        });
    }
}
