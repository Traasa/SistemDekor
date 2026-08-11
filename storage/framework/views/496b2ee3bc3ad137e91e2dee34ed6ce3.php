<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan</title>
    <style>
        @page {
            size: landscape;
            margin: 20px;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #000;
        }
        .header h2 {
            margin: 5px 0;
            font-size: 16px;
            color: #0066cc;
        }
        .header p {
            margin: 0;
            font-size: 12px;
            font-weight: bold;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 6px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #000;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-row {
            font-weight: bold;
            background-color: #e6e6e6;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Sistem Dekor</h1>
        <h2>Penjualan - Rangkuman</h2>
        <p><?php echo e(\Carbon\Carbon::parse($startDate)->format('l, F d, Y')); ?> - <?php echo e(\Carbon\Carbon::parse($endDate)->format('l, F d, Y')); ?></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>No. Pesanan</th>
                <th>Pelanggan</th>
                <th class="text-right">Sub Total</th>
                <th class="text-right">Diskon</th>
                <th class="text-right">Pajak</th>
                <th class="text-right">Total Penjualan</th>
                <th class="text-right">Pembayaran</th>
                <th class="text-right">Saldo</th>
            </tr>
        </thead>
        <tbody>
            <?php
                $sumSubTotal = 0;
                $sumDiskon = 0;
                $sumPajak = 0;
                $sumTotal = 0;
                $sumPembayaran = 0;
                $sumSaldo = 0;
            ?>
            
            <?php $__currentLoopData = $orders; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $order): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <?php
                    $pembayaran = $order->dp_amount ?? $order->deposit_amount ?? 0;
                    $sumSubTotal += $order->total_price;
                    $sumDiskon += $order->discount;
                    $sumPajak += $order->additional_costs ?? 0;
                    $sumTotal += $order->final_price;
                    $sumPembayaran += $pembayaran;
                    $sumSaldo += $order->remaining_amount;
                ?>
                <tr>
                    <td><?php echo e($order->created_at->format('d/m/Y')); ?></td>
                    <td><?php echo e($order->order_number ?? $order->order_code); ?></td>
                    <td><?php echo e($order->client->name ?? 'N/A'); ?></td>
                    <td class="text-right"><?php echo e(number_format($order->total_price, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($order->discount, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($order->additional_costs ?? 0, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($order->final_price, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($pembayaran, 2)); ?></td>
                    <td class="text-right"><?php echo e(number_format($order->remaining_amount, 2)); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="text-right">Total :</td>
                <td class="text-right"><?php echo e(number_format($sumSubTotal, 2)); ?></td>
                <td class="text-right"><?php echo e(number_format($sumDiskon, 2)); ?></td>
                <td class="text-right"><?php echo e(number_format($sumPajak, 2)); ?></td>
                <td class="text-right"><?php echo e(number_format($sumTotal, 2)); ?></td>
                <td class="text-right"><?php echo e(number_format($sumPembayaran, 2)); ?></td>
                <td class="text-right"><?php echo e(number_format($sumSaldo, 2)); ?></td>
            </tr>
        </tfoot>
    </table>

</body>
</html>
<?php /**PATH C:\laragon\www\SistemDekor\resources\views/pdf/sales_report.blade.php ENDPATH**/ ?>