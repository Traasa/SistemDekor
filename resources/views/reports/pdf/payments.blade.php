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
            background-color: #7c3aed;
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
        <h3>Ringkasan Pembayaran</h3>
        <div class="summary-row">
            <span>Total Piutang</span>
            <span><strong>Rp {{ number_format($data['total_receivable'], 0, ',', '.') }}</strong></span>
        </div>
        <div class="summary-row">
            <span>Total Diterima</span>
            <span><strong>Rp {{ number_format($data['total_received'], 0, ',', '.') }}</strong></span>
        </div>
    </div>

    @if(count($data['details']) > 0)
    <table>
        <thead>
            <tr>
                <th>No Order</th>
                <th>Client</th>
                <th>Tanggal Event</th>
                <th class="text-right">Total</th>
                <th class="text-right">Terbayar</th>
                <th class="text-right">Sisa</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['details'] as $detail)
            <tr>
                <td>{{ $detail['order_number'] }}</td>
                <td>{{ $detail['client_name'] }}</td>
                <td>{{ \Carbon\Carbon::parse($detail['event_date'])->format('d M Y') }}</td>
                <td class="text-right">Rp {{ number_format($detail['total_amount'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($detail['paid_amount'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($detail['outstanding_amount'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="text-align: center; padding: 20px; color: #999;">Tidak ada data pembayaran</p>
    @endif

    <div class="footer">
        <p>Wedding Organizer - Laporan Pembayaran</p>
        <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
    </div>
</body>
</html>
