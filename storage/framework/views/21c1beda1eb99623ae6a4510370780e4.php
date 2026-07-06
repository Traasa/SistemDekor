<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice <?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2933; line-height: 1.4; }
        
        /* Layout Dasar Menggunakan Tabel */
        .w-full { width: 100%; }
        .borderless-table { width: 100%; border-collapse: collapse; }
        .borderless-table td { border: none; padding: 0; vertical-align: top; }
        
        /* Header & Meta */
        .header-container { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
        .brand { font-size: 22px; font-weight: bold; color: #b88a4a; letter-spacing: 0.5px; }
        .meta-title { font-size: 16px; font-weight: bold; color: #1f2933; text-transform: uppercase; margin-bottom: 4px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Typography & Utilities */
        .section-title { font-size: 13px; font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; }
        .muted { color: #6b7280; }
        .bold { font-weight: bold; }
        
        /* Tabel Data / Manifes */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; }
        .data-table th { background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 6px 8px; font-weight: bold; color: #374151; text-align: left; }
        .data-table td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        
        /* Blok Informasi Klien & Acara */
        .info-cell { width: 48%; }
        .info-spacer { width: 4%; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 3px 0; font-size: 11px; }
        .info-label { width: 30%; color: #6b7280; }
        .info-value { width: 70%; }

        /* Blok Ringkasan Finansial */
        .summary-wrapper { width: 100%; margin-top: 15px; }
        .summary-table { width: 40%; margin-left: auto; border-collapse: collapse; }
        .summary-table td { padding: 4px 8px; text-align: right; }
        .summary-table .label { text-align: left; color: #6b7280; }
        .summary-table .total-row { font-size: 13px; font-weight: bold; color: #b88a4a; background-color: #fdfbf7; border-top: 1px solid #e5e7eb; }
        
        /* Badge Status */
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background-color: #f3f4f6; color: #374151; text-transform: uppercase; }
        .badge-success { background-color: #dcfce7; color: #166534; font-weight: bold; border: 1px solid #bbf7d0; }
        .badge-warning { background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1px solid #fde68a; }
        
        .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 10px; }
    </style>
</head>
<body>

    <!-- HEADER SECTION USING TABLE LAYOUT -->
    <div class="header-container">
        <table class="borderless-table">
            <tr>
                <td>
                    <div class="brand">Ade Decoration</div>
                    <div class="muted" style="font-size: 12px; margin-top: 2px;">Wedding Organizer & Decoration</div>
                </td>
                <td class="text-right">
                    <div class="meta-title">Invoice</div>
                    <div><span class="muted">No:</span> <span class="bold"><?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></span></div>
                    <div class="muted">Tanggal: <?php echo e(optional($order->created_at)->format('d M Y')); ?></div>
                    <div>
                        <span class="muted">Status:</span> 
                        <?php if(($order->payment_status ?? '-') === 'LUNAS' || ($order->payment_status ?? '-') === 'verified'): ?>
                            <span class="badge badge-success">LUNAS</span>
                        <?php else: ?>
                            <span class="badge badge-warning"><?php echo e($order->payment_status ?? '-'); ?></span>
                        <?php endif; ?>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- CLIENT AND EVENT INFO USING SIDE-BY-SIDE TABLES -->
    <table class="borderless-table" style="margin-bottom: 10px;">
        <tr>
            <!-- Data Klien -->
            <td class="info-cell">
                <div class="section-title">Data Klien</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Nama</td>
                        <td class="info-value">: <?php echo e($order->client->name ?? '-'); ?></td>
                    </tr>
                    <tr>
                        <td class="info-label">Email</td>
                        <td class="info-value">: <?php echo e($order->client->email ?? '-'); ?></td>
                    </tr>
                    <tr>
                        <td class="info-label">Telepon</td>
                        <td class="info-value">: <?php echo e($order->client->phone ?? '-'); ?></td>
                    </tr>
                </table>
            </td>
            
            <!-- Spacer -->
            <td class="info-spacer"></td>
            
            <!-- Detail Acara -->
            <td class="info-cell">
                <div class="section-title">Detail Acara</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Acara</td>
                        <td class="info-value">: <?php echo e($order->event_name ?? '-'); ?></td>
                    </tr>
                    <tr>
                        <td class="info-label">Tanggal</td>
                        <td class="info-value">: <?php echo e(optional($order->event_date)->format('d M Y') ?? '-'); ?></td>
                    </tr>
                    <tr>
                        <td class="info-label">Lokasi</td>
                        <td class="info-value">: <?php echo e($order->event_location ?? $order->event_address ?? '-'); ?></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- ORDER DETAILS TABLE -->
    <div class="section-title">Rincian Pesanan</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 22%; text-align: right;">Harga</th>
                <th style="width: 23%; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <?php $__empty_1 = true; $__currentLoopData = $order->orderDetails; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $detail): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><?php echo e($detail->item_name); ?></td>
                    <td class="text-center"><?php echo e($detail->quantity); ?></td>
                    <td class="text-right">Rp <?php echo e(number_format($detail->cost ?? 0, 0, ',', '.')); ?></td>
                    <td class="text-right">Rp <?php echo e(number_format($detail->subtotal ?? 0, 0, ',', '.')); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr>
                    <?php
                        $fallbackPrice = $order->package->base_price
                            ?? $order->total_price
                            ?? $order->final_price
                            ?? 0;
                    ?>
                    <td>Paket <?php echo e($order->package->name ?? 'Custom Package'); ?></td>
                    <td class="text-center">1</td>
                    <td class="text-right">Rp <?php echo e(number_format($fallbackPrice, 0, ',', '.')); ?></td>
                    <td class="text-right">Rp <?php echo e(number_format($fallbackPrice, 0, ',', '.')); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- FIRST FINANCIAL SUMMARY (RIGHT ALIGNED) -->
    <table class="borderless-table summary-wrapper">
        <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%;">
                <table class="summary-table w-full">
                    <tr>
                        <td class="label">Total Harga</td>
                        <td>Rp <?php echo e(number_format($order->total_price ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                    <tr>
                        <td class="label">Diskon</td>
                        <td>Rp <?php echo e(number_format($order->discount ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                    <tr class="total-row">
                        <td class="label bold" style="color: #b88a4a;">Total Bayar</td>
                        <td class="bold">Rp <?php echo e(number_format($order->final_price ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <?php
        $paymentProofs = $order->paymentProofs ?? collect();
        $paymentLabels = [
            'booking' => 'Booking Fee',
            'dp' => 'Down Payment (DP)',
            'installment' => 'Cicilan',
            'full' => 'Pelunasan',
        ];
        $installmentIndex = 1;
        $finalPrice = $order->final_price ?? 0;
        $defaultDp = (int) round($finalPrice * 0.3);
        $defaultInstallment = (int) round($finalPrice * 0.4);
        $defaultFull = max($finalPrice - $defaultDp - $defaultInstallment, 0);
        $totalPaid = $order->total_paid ?? 0;
        $remainingPayment = $order->remaining_payment ?? 0;
    ?>

    <!-- PAYMENT TERMINS TABLE -->
    <div class="section-title" style="margin-top: 25px;">Jadwal & Status Termin Pembayaran</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 40%;">Termin Pembayaran</th>
                <th style="width: 25%; text-align: right;">Nominal</th>
                <th style="width: 20%; text-align: center;">Tanggal</th>
                <th style="width: 15%; text-align: center;">Status</th>
            </tr>
        </thead>
        <tbody>
            <?php if($paymentProofs->isNotEmpty()): ?>
                <?php $__currentLoopData = $paymentProofs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $proof): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <?php
                        $label = $paymentLabels[$proof->payment_type] ?? 'Pembayaran';
                        if ($proof->payment_type === 'installment') {
                            $label .= ' ' . $installmentIndex;
                            $installmentIndex++;
                        }
                        $isVerified = $proof->status === 'verified';
                        $statusText = $isVerified ? 'LUNAS' : ($proof->status === 'rejected' ? 'DITOLAK' : 'MENUNGGU');
                    ?>
                    <tr>
                        <td><?php echo e($loop->iteration); ?>. <?php echo e($label); ?></td>
                        <td class="text-right">Rp <?php echo e(number_format($proof->amount ?? 0, 0, ',', '.')); ?></td>
                        <td class="text-center"><?php echo e(optional($proof->verified_at ?? $proof->created_at)->format('d M Y') ?? '-'); ?></td>
                        <td class="text-center">
                            <span class="badge <?php echo e($isVerified ? 'badge-success' : ''); ?>">
                                <?php echo e($statusText); ?>

                            </span>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php else: ?>
                <?php
                    $finalPrice = $order->final_price ?? 0;
                    $initialPaymentType = $order->initial_payment_type ?? 'dp';
                    $bookingAmount = (float) ($order->booking_amount ?? 0);
                    $dpAmount = (float) ($order->dp_amount ?? 0);
                    $remainingAmount = (float) ($order->remaining_amount ?? $finalPrice);
                    
                    $terminList = [];
                    if ($initialPaymentType === 'booking' && $bookingAmount > 0) {
                        $terminList[] = ['label' => 'Booking Fee', 'amount' => $bookingAmount];
                        if ($dpAmount > 0) {
                            $terminList[] = ['label' => 'Down Payment (DP)', 'amount' => $dpAmount];
                        }
                    } else {
                        if ($dpAmount > 0) {
                            $terminList[] = ['label' => 'Down Payment (DP)', 'amount' => $dpAmount];
                        }
                    }

                    if (empty($terminList)) {
                        $terminList[] = ['label' => 'Down Payment (DP) 30%', 'amount' => (int) round($finalPrice * 0.3)];
                    }
                ?>
                
                <?php $__currentLoopData = $terminList; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $termin): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($index + 1); ?>. <?php echo e($termin['label']); ?></td>
                        <td class="text-right">Rp <?php echo e(number_format($termin['amount'], 0, ',', '.')); ?></td>
                        <td class="text-center">-</td>
                        <td class="text-center"><span class="badge">BELUM</span></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- FINAL BILLING SUMMARY (RIGHT ALIGNED) -->
    <table class="borderless-table summary-wrapper" style="margin-top: 10px;">
        <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%;">
                <table class="summary-table w-full">
                    <tr>
                        <td class="label">Total Dibayar</td>
                        <td>Rp <?php echo e(number_format($totalPaid, 0, ',', '.')); ?></td>
                    </tr>
                    <tr class="total-row" style="background-color: #fbfbfe;">
                        <td class="label bold" style="color: #1f2933;">Sisa Tagihan</td>
                        <td class="bold" style="color: #1f2933;">Rp <?php echo e(number_format($remainingPayment, 0, ',', '.')); ?></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- FOOTER -->
    <div class="footer">
        Invoice ini dibuat otomatis oleh Ade Decoration. Silakan hubungi admin bila ada pertanyaan.
    </div>

</body>
</html><?php /**PATH C:\laragon\www\SistemDekor\resources\views/pdf/order-invoice.blade.php ENDPATH**/ ?>