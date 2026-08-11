<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice <?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.5; }
        .w-full { width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        td { vertical-align: top; }
        
        /* Typography & Colors */
        .text-blue { color: #2b5797; }
        .text-dark-blue { color: #1e3a5f; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .title-invoice { font-size: 24px; font-weight: bold; color: #2b5797; margin-bottom: 10px; }
        
        /* Header Meta Table */
        .meta-table { width: auto; float: right; }
        .meta-table td { padding: 2px 10px; }
        .meta-table .label { text-align: right; color: #666; }
        
        /* Info Blocks */
        .info-section { margin-top: 30px; margin-bottom: 25px; }
        .info-title { font-weight: bold; font-size: 12px; margin-bottom: 5px; color: #1e3a5f; }
        .info-line { border-bottom: 2px solid #2b5797; margin-bottom: 8px; }
        .info-content { color: #555; }
        
        /* Main Data Table */
        .data-table { margin-bottom: 20px; }
        .data-table th { background-color: #253448; color: #fff; padding: 8px; text-align: left; font-size: 11px; }
        .data-table td { padding: 8px; border-bottom: 1px solid #eee; background-color: #ffffff; }
        .data-table tr:nth-child(even) td { background-color: #f8fafc; }
        
        /* Summary Section */
        .summary-table td { padding: 4px 8px; }
        .summary-label { text-align: right; font-weight: bold; color: #555; }
        .summary-value { text-align: right; width: 120px; }
        
        /* Down Payment / Termin Table */
        .dp-table { margin-top: 15px; width: 100%; float: right; border-collapse: collapse; }
        .dp-table th { background-color: #dbeafe; color: #1e3a5f; padding: 6px; text-align: left; font-weight: normal; }
        .dp-table td { padding: 6px; border-bottom: 1px solid #e5e7eb; background-color: #f3f4f6; }
        
        /* Footer Totals */
        .total-due { font-size: 12px; font-weight: bold; }
        .total-due td { padding: 8px; border-top: 1px solid #333; border-bottom: 1px solid #333; }
    </style>
</head>
<body>

    <!-- SECTION 1: HEADER -->
    <table>
        <tr>
            <td style="width: 50%;">
                <!-- Placeholder Logo Berbentuk Lingkaran -->
                <div style="width: 90px; height: 90px; border: 2px solid #60a5fa; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #60a5fa; font-weight: bold; font-size: 18px; text-align: center; line-height: 90px;">
                    ADE DEC.
                </div>
            </td>
            <td style="width: 50%; text-align: right;">
                <div class="title-invoice">Invoice</div>
                <table class="meta-table">
                    <tr>
                        <td class="label">Referensi</td>
                        <td><?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></td>
                    </tr>
                    <tr>
                        <td class="label">Tanggal</td>
                        <td><?php echo e(optional($order->created_at)->format('d/m/Y')); ?></td>
                    </tr>
                    <tr>
                        <td class="label">Status</td>
                        <td class="bold">
                            <?php if(($order->payment_status ?? '-') === 'LUNAS' || ($order->payment_status ?? '-') === 'verified'): ?>
                                <span style="color: #166534;">LUNAS</span>
                            <?php else: ?>
                                <span style="color: #92400e;"><?php echo e(strtoupper($order->payment_status ?? '-')); ?></span>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION 2: CLIENT & COMPANY INFO -->
    <table class="info-section">
        <tr>
            <td style="width: 48%;">
                <div class="info-title">Info Perusahaan</div>
                <div class="info-line"></div>
                <div class="bold text-blue" style="margin-bottom: 5px;">ADE DECORATION</div>
                <div class="info-content">
                    Wedding Organizer & Decoration<br><br>
                    <strong>Acara:</strong> <?php echo e($order->event_name ?? '-'); ?><br>
                    <strong>Tgl Acara:</strong> <?php echo e(optional($order->event_date)->format('d M Y') ?? '-'); ?><br>
                    <strong>Lokasi:</strong> <?php echo e($order->event_location ?? $order->event_address ?? '-'); ?>

                </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%;">
                <div class="info-title">Tagihan Untuk</div>
                <div class="info-line"></div>
                <div class="bold text-blue" style="margin-bottom: 5px;"><?php echo e(strtoupper($order->client->name ?? '-')); ?></div>
                <div class="info-content">
                    <strong>Email:</strong> <?php echo e($order->client->email ?? '-'); ?><br>
                    <strong>Telp:</strong> <?php echo e($order->client->phone ?? '-'); ?>

                </div>
            </td>
        </tr>
    </table>

    <!-- SECTION 3: ORDER DETAILS / DATA TABLE -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 45%;">Produk / Item</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Harga</th>
                <th style="width: 25%; text-align: right;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <?php $__empty_1 = true; $__currentLoopData = $order->orderDetails; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $detail): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><?php echo e($detail->item_name); ?></td>
                    <td class="text-center"><?php echo e($detail->quantity); ?></td>
                    <td class="text-right"><?php echo e(number_format($detail->cost ?? 0, 0, ',', '.')); ?></td>
                    <td class="text-right"><?php echo e(number_format($detail->subtotal ?? 0, 0, ',', '.')); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr>
                    <?php
                        $fallbackPrice = $order->package->base_price ?? $order->total_price ?? $order->final_price ?? 0;
                    ?>
                    <td>Paket <?php echo e($order->package->name ?? 'Custom Package'); ?></td>
                    <td class="text-center">1</td>
                    <td class="text-right"><?php echo e(number_format($fallbackPrice, 0, ',', '.')); ?></td>
                    <td class="text-right"><?php echo e(number_format($fallbackPrice, 0, ',', '.')); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <!-- SECTION 4: SUMMARY & TERMIN -->
    <table>
        <tr>
            <!-- Keterangan -->
            <td style="width: 50%; padding-right: 20px;">
                <div class="info-title">Keterangan</div>
                <div class="info-line" style="border-bottom: 1px solid #ccc;"></div>
                <div style="font-size: 10px; color: #555; margin-bottom: 15px;">
                    Catatan: Invoice ini diterbitkan secara otomatis.
                </div>

                <div class="info-title">Syarat & Ketentuan</div>
                <div class="info-line" style="border-bottom: 1px solid #ccc;"></div>
                <div style="font-size: 10px; color: #555;">
                    <?php if(($order->payment_status ?? '-') === 'LUNAS' || ($order->payment_status ?? '-') === 'verified'): ?>
                        Pembayaran telah diselesaikan. Terima kasih atas kerja samanya.
                    <?php else: ?>
                        Harap selesaikan sisa pembayaran sesuai dengan termin yang berlaku sebelum tanggal acara dimulai.
                    <?php endif; ?>
                </div>
            </td>
            
            <!-- Perhitungan Finansial -->
            <td style="width: 50%;">
                <table class="summary-table" style="width: 100%;">
                    <tr>
                        <td class="summary-label">Subtotal</td>
                        <td class="summary-value">Rp <?php echo e(number_format($order->total_price ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                    <tr>
                        <td class="summary-label">Total Diskon</td>
                        <td class="summary-value">Rp <?php echo e(number_format($order->discount ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                    <tr>
                        <td class="summary-label bold" style="color:#333;">Total</td>
                        <td class="summary-value bold" style="color:#333;">Rp <?php echo e(number_format($order->final_price ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                    <tr>
                        <td class="summary-label">Lunas (Sudah Dibayar)</td>
                        <td class="summary-value">Rp <?php echo e(number_format($order->total_paid ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                </table>

                <?php
                    $paymentProofs = $order->paymentProofs ?? collect();
                    $paymentLabels = ['booking' => 'Booking', 'dp' => 'DP', 'installment' => 'Cicilan', 'full' => 'Pelunasan'];
                    $installmentIndex = 1;
                ?>

                <!-- Tabel Down Payment / Termin -->
                <div style="text-align: center; font-weight: bold; font-size: 11px; margin-top: 15px;">Riwayat Pembayaran</div>
                <?php if($paymentProofs->isNotEmpty()): ?>
                <table class="dp-table">
                    <thead>
                        <tr>
                            <th>No. Termin</th>
                            <th style="text-align: center;">Tgl. Bayar</th>
                            <th style="text-align: right;">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $__currentLoopData = $paymentProofs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $proof): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <?php
                                $label = $paymentLabels[$proof->payment_type] ?? 'Pembayaran';
                                if ($proof->payment_type === 'installment') {
                                    $label .= ' ' . $installmentIndex++;
                                }
                            ?>
                            <tr>
                                <td><?php echo e($label); ?> - <?php echo e($proof->status === 'verified' ? 'LUNAS' : 'PENDING'); ?></td>
                                <td style="text-align: center;"><?php echo e(optional($proof->verified_at ?? $proof->created_at)->format('Y-m-d') ?? '-'); ?></td>
                                <td style="text-align: right; font-weight: bold;">Rp (<?php echo e(number_format($proof->amount ?? 0, 0, ',', '.')); ?>)</td>
                            </tr>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </tbody>
                </table>
                <?php endif; ?>

                <!-- Total Tagihan -->
                <table style="width: 100%; margin-top: 10px;">
                    <tr class="total-due">
                        <td class="summary-label" style="text-align: left; padding-left: 0;">Jumlah Tertagih:</td>
                        <td class="summary-value">Rp <?php echo e(number_format($order->remaining_payment ?? 0, 0, ',', '.')); ?></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION 5: FOOTER SIGNATURE -->
    <table style="margin-top: 40px;">
        <tr>
            <td style="width: 70%;"></td>
            <td style="width: 30%; text-align: center;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 50px;">
                    <?php echo e(optional($order->created_at)->format('d M, Y')); ?>

                </div>
                <div style="font-weight: bold; border-top: 1px solid #333; padding-top: 5px;">
                    Finance
                </div>
            </td>
        </tr>
    </table>

</body>
</html><?php /**PATH C:\laragon\www\SistemDekor\resources\views/pdf/order-invoice.blade.php ENDPATH**/ ?>