<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\PaymentProof;
use App\Models\SystemNotification;

class SystemNotificationService
{
    public static function create(
        string $type,
        string $title,
        string $message,
        ?string $link = null,
        ?array $metadata = null
    ): SystemNotification {
        return SystemNotification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'metadata' => $metadata,
            'created_by' => auth()->id(),
        ]);
    }

    public static function orderCreated(Order $order, string $source = 'system'): SystemNotification
    {
        $orderCode = $order->order_number ?? 'ORD-' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);

        return self::create(
            'order',
            'Order Baru Masuk',
            "{$orderCode} dibuat melalui {$source} untuk {$order->client?->name}",
            '/admin/orders/' . $order->id,
            [
                'order_id' => $order->id,
                'source' => $source,
            ]
        );
    }

    public static function orderStatusUpdated(Order $order, ?string $oldStatus = null): SystemNotification
    {
        $orderCode = $order->order_number ?? 'ORD-' . str_pad((string) $order->id, 6, '0', STR_PAD_LEFT);
        $statusText = $oldStatus ? "{$oldStatus} -> {$order->status}" : $order->status;

        return self::create(
            'order',
            'Status Order Diupdate',
            "{$orderCode} berubah menjadi {$statusText}",
            '/admin/orders/' . $order->id,
            [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $order->status,
            ]
        );
    }

    public static function paymentProofSubmitted(PaymentProof $proof): SystemNotification
    {
        $order = $proof->order;
        $orderCode = $order?->order_number ?? 'ORD-' . str_pad((string) $proof->order_id, 6, '0', STR_PAD_LEFT);

        return self::create(
            'payment',
            'Bukti Pembayaran Baru',
            "{$orderCode} mengirim bukti pembayaran {$proof->payment_type} sebesar Rp " . number_format((float) $proof->amount, 0, ',', '.'),
            '/admin/payments',
            [
                'order_id' => $proof->order_id,
                'payment_proof_id' => $proof->id,
                'payment_type' => $proof->payment_type,
            ]
        );
    }

    public static function paymentVerified(PaymentProof $proof): SystemNotification
    {
        $order = $proof->order;
        $orderCode = $order?->order_number ?? 'ORD-' . str_pad((string) $proof->order_id, 6, '0', STR_PAD_LEFT);

        return self::create(
            'payment',
            'Pembayaran Diverifikasi',
            "Pembayaran {$proof->payment_type} untuk {$orderCode} berhasil diverifikasi",
            '/admin/orders/' . $proof->order_id,
            [
                'order_id' => $proof->order_id,
                'payment_proof_id' => $proof->id,
            ]
        );
    }

    public static function paymentRejected(PaymentProof $proof): SystemNotification
    {
        $order = $proof->order;
        $orderCode = $order?->order_number ?? 'ORD-' . str_pad((string) $proof->order_id, 6, '0', STR_PAD_LEFT);

        return self::create(
            'payment',
            'Pembayaran Ditolak',
            "Bukti pembayaran {$proof->payment_type} untuk {$orderCode} ditolak",
            '/admin/payments',
            [
                'order_id' => $proof->order_id,
                'payment_proof_id' => $proof->id,
            ]
        );
    }

    public static function lowStock(InventoryItem $item, ?int $stockBefore = null, ?int $stockAfter = null): ?SystemNotification
    {
        if ((int) $item->quantity > (int) $item->minimum_stock) {
            return null;
        }

        $duplicateExists = SystemNotification::query()
            ->where('type', 'inventory')
            ->where('created_at', '>=', now()->subHours(6))
            ->whereJsonContains('metadata->inventory_item_id', $item->id)
            ->exists();

        if ($duplicateExists) {
            return null;
        }

        $beforeText = $stockBefore !== null ? "{$stockBefore} -> " : '';
        $afterText = $stockAfter !== null ? (string) $stockAfter : (string) $item->quantity;

        return self::create(
            'inventory',
            'Stok Menipis',
            "{$item->name}: {$beforeText}{$afterText} (minimum {$item->minimum_stock})",
            '/admin/inventory',
            [
                'inventory_item_id' => $item->id,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter ?? $item->quantity,
                'minimum_stock' => $item->minimum_stock,
            ]
        );
    }
}
