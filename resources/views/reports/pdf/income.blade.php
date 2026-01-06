<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
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
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #1e40af;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 5px;
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
        <h1>{{ $title }}</h1>
        <p>Periode: {{ \Carbon\Carbon::parse($startDate)->format('d F Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}</p>
        <p>Digenerate pada: {{ $generatedAt }}</p>
    </div>

    <div class="summary-box">
        <h3 style="margin-top: 0;">Pendapatan</h3>
        <div class="summary-row">
            <span class="label">Revenue dari Order</span>
            <span class="amount positive">Rp {{ number_format($data['revenue'], 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="summary-box">
        <h3 style="margin-top: 0;">Harga Pokok Penjualan (HPP)</h3>
        <div class="summary-row">
            <span class="label">Cost of Goods Sold</span>
            <span class="amount negative">Rp {{ number_format($data['cost_of_goods_sold'], 0, ',', '.') }}</span>
        </div>
    </div>

    <div class="summary-box">
        <h3 style="margin-top: 0;">Laba Kotor</h3>
        <div class="summary-row">
            <span class="label">Gross Profit</span>
            <span class="amount {{ $data['gross_profit'] >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($data['gross_profit'], 0, ',', '.') }}
            </span>
        </div>
        <div class="summary-row">
            <span class="label">Gross Margin</span>
            <span class="amount">{{ number_format($data['gross_margin_percentage'], 2) }}%</span>
        </div>
    </div>

    <div class="footer">
        <p>Wedding Organizer - Laporan Laba Rugi</p>
        <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
    </div>
</body>
</html>
