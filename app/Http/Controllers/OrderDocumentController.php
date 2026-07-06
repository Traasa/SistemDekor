<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class OrderDocumentController extends Controller
{
    private function loadOrder(int $id): Order
    {
        return Order::with([
            'client',
            'package',
            'orderDetails',
            'paymentProofs' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
        ])->findOrFail($id);
    }

    private function authorizeClient(Request $request, Order $order): void
    {
        $user = $request->user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $client = \App\Models\Client::where('email', $user->email)->first();
        if ($client && $order->client_id !== $client->id) {
            abort(403, 'Unauthorized access to order');
        }
    }

    public function downloadInvoiceAdmin(int $id)
    {
        $order = $this->loadOrder($id);
        $pdf = Pdf::loadView('pdf.order-invoice', compact('order'));
        return $pdf->stream('Invoice-' . ($order->order_number ?? ('ORD-' . $order->id)) . '.pdf');
    }

    public function downloadContractAdmin(int $id)
    {
        $order = $this->loadOrder($id);
        $pdf = Pdf::loadView('pdf.order-contract', compact('order'));
        return $pdf->stream('Kontrak-' . ($order->order_number ?? ('ORD-' . $order->id)) . '.pdf');
    }

    public function downloadInvoiceClient(Request $request, int $id)
    {
        $order = $this->loadOrder($id);
        $this->authorizeClient($request, $order);
        $pdf = Pdf::loadView('pdf.order-invoice', compact('order'));
        return $pdf->stream('Invoice-' . ($order->order_number ?? ('ORD-' . $order->id)) . '.pdf');
    }

    public function downloadContractClient(Request $request, int $id)
    {
        $order = $this->loadOrder($id);
        $this->authorizeClient($request, $order);
        $pdf = Pdf::loadView('pdf.order-contract', compact('order'));
        return $pdf->stream('Kontrak-' . ($order->order_number ?? ('ORD-' . $order->id)) . '.pdf');
    }
}
