<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            color: #1e40af;
        }
        .header p {
            margin: 3px 0;
            color: #666;
        }
        .summary-box {
            border: 1px solid #ddd;
            padding: 12px;
            margin-bottom: 15px;
            background-color: #f9f9f9;
        }
        .summary-box h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        .summary-row {
            padding: 5px 0;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #eee;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        table thead {
            background-color: #059669;
            color: white;
        }
        table th {
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
        }
        table td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Periode: {{ \Carbon\Carbon::parse($startDate)->format('d F Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}</p>
        <p>Digenerate pada: {{ $generatedAt }}</p>
    </div>

    <div class="summary-box">
        <h3>Ringkasan Inventaris</h3>
        <div class="summary-row">
            <span>Total Item</span>
            <span><strong>{{ $data['total_items'] }}</strong></span>
        </div>
    </div>

    @if(count($data['items']) > 0)
    <table>
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama Item</th>
                <th>Kategori</th>
                <th class="text-right">Stok</th>
                <th>Unit</th>
                <th class="text-right">Harga Beli</th>
                <th class="text-right">Harga Jual</th>
                <th class="text-right">Nilai Stok</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['items'] as $item)
            <tr>
                <td>{{ $item['code'] }}</td>
                <td>{{ $item['name'] }}</td>
                <td>{{ $item['category'] }}</td>
                <td class="text-right">{{ $item['current_stock'] }}</td>
                <td>{{ $item['unit'] }}</td>
                <td class="text-right">Rp {{ number_format($item['purchase_price'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item['selling_price'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item['stock_value'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="text-align: center; padding: 20px; color: #999;">Tidak ada data inventaris</p>
    @endif

    <div class="footer">
        <p>Wedding Organizer - Laporan Inventaris</p>
        <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
    </div>
</body>
</html>
