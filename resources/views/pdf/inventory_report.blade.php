<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Inventaris</title>
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
        .status-low { color: #f59e0b; font-weight: bold; }
        .status-out { color: #ef4444; font-weight: bold; }
        .status-ok { color: #10b981; font-weight: bold; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Ade Decoration</h1>
        <h2>Laporan Inventaris</h2>
        <p>Dicetak pada: {{ \Carbon\Carbon::now()->format('l, F d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nama Item</th>
                <th>Kategori</th>
                <th class="text-right">Stok Saat Ini</th>
                <th class="text-right">Stok Min.</th>
                <th class="text-center">Satuan</th>
                <th class="text-right">Harga Satuan (IDR)</th>
                <th class="text-right">Total Nilai (IDR)</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @php
                $sumTotalValue = 0;
            @endphp
            
            @foreach($items as $item)
                @php
                    $status = 'OK';
                    $statusClass = 'status-ok';
                    if ($item->current_stock <= 0) {
                        $status = 'Out of Stock';
                        $statusClass = 'status-out';
                    } elseif ($item->current_stock <= $item->minimum_stock) {
                        $status = 'Low Stock';
                        $statusClass = 'status-low';
                    }
                    
                    $totalValue = $item->current_stock * $item->unit_price;
                    $sumTotalValue += $totalValue;
                @endphp
                <tr>
                    <td>{{ $item->name }}</td>
                    <td>{{ $item->category->name ?? 'N/A' }}</td>
                    <td class="text-right">{{ number_format($item->current_stock, 0) }}</td>
                    <td class="text-right">{{ number_format($item->minimum_stock, 0) }}</td>
                    <td class="text-center">{{ $item->unit }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format($totalValue, 2) }}</td>
                    <td class="text-center {{ $statusClass }}">{{ $status }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="6" class="text-right">Total Nilai Inventaris :</td>
                <td class="text-right">{{ number_format($sumTotalValue, 2) }}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

</body>
</html>
