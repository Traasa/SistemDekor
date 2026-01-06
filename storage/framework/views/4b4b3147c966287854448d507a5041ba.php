<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?php echo e($title); ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1e40af;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 5px;
        }
        .content {
            margin: 20px 0;
        }
        .summary-box {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .summary-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 14px;
        }
        .label {
            font-weight: bold;
        }
        .amount {
            text-align: right;
        }
        .positive {
            color: #059669;
        }
        .negative {
            color: #dc2626;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1><?php echo e($title); ?></h1>
        <p>Periode: <?php echo e(\Carbon\Carbon::parse($startDate)->format('d F Y')); ?> - <?php echo e(\Carbon\Carbon::parse($endDate)->format('d F Y')); ?></p>
        <p>Digenerate pada: <?php echo e($generatedAt); ?></p>
    </div>

    <div class="content">
        <div class="summary-box">
            <h3 style="margin-top: 0;">Ringkasan Cash Flow</h3>
            
            <div class="summary-row">
                <span class="label">Pendapatan (Income)</span>
                <span class="amount positive">Rp <?php echo e(number_format($data['income'], 0, ',', '.')); ?></span>
            </div>
            
            <div class="summary-row">
                <span class="label">Pengeluaran Inventaris</span>
                <span class="amount">Rp <?php echo e(number_format($data['expenses']['inventory'], 0, ',', '.')); ?></span>
            </div>
            
            <div class="summary-row">
                <span class="label">Pengeluaran Lainnya</span>
                <span class="amount">Rp <?php echo e(number_format($data['expenses']['other'], 0, ',', '.')); ?></span>
            </div>
            
            <div class="summary-row">
                <span class="label">Total Pengeluaran</span>
                <span class="amount negative">Rp <?php echo e(number_format($data['expenses']['total'], 0, ',', '.')); ?></span>
            </div>
            
            <div class="summary-row">
                <span class="label">Keuntungan Bersih</span>
                <span class="amount <?php echo e($data['net_profit'] >= 0 ? 'positive' : 'negative'); ?>">
                    Rp <?php echo e(number_format($data['net_profit'], 0, ',', '.')); ?>

                </span>
            </div>
            
            <div class="summary-row">
                <span class="label">Profit Margin</span>
                <span class="amount"><?php echo e(number_format($data['profit_margin'], 2)); ?>%</span>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Wedding Organizer - Laporan Cash Flow</p>
        <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
    </div>
</body>
</html>
<?php /**PATH C:\laragon\www\SistemDekor\resources\views/reports/pdf/cashflow.blade.php ENDPATH**/ ?>