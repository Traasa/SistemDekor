<!DOCTYPE html>
<html>

<head>
    <title>Invoice - {{ $transaction->transaction_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }

        .invoice-title {
            font-size: 20px;
            margin-top: 10px;
            color: #34495e;
        }

        .invoice-info {
            margin: 20px 0;
        }

        .info-row {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
        }

        .label {
            font-weight: bold;
            width: 150px;
        }

        .value {
            flex: 1;
        }

        .service-detail {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }

        .total-section {
            margin-top: 30px;
            text-align: right;
            border-top: 2px solid #333;
            padding-top: 15px;
        }

        .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status.pending {
            background-color: #f39c12;
            color: white;
        }

        .status.selesai {
            background-color: #27ae60;
            color: white;
        }

        .status.dibatalkan {
            background-color: #e74c3c;
            color: white;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="company-name">SistemDekor</div>
        <div class="invoice-title">INVOICE TRANSAKSI DEKORASI</div>
    </div>

    <div class="invoice-info">
        <div class="info-row">
            <span class="label">No. Transaksi:</span>
            <span class="value">{{ $transaction->transaction_number }}</span>
        </div>
        <div class="info-row">
            <span class="label">Nama Klien:</span>
            <span class="value">{{ $transaction->client_name }}</span>
        </div>
        <div class="info-row">
            <span class="label">Tanggal:</span>
            <span class="value">{{ $transaction->transaction_date->format('d/m/Y') }}</span>
        </div>
        <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
                <span class="status {{ $transaction->status }}">{{ ucfirst($transaction->status) }}</span>
            </span>
        </div>
        <div class="info-row">
            <span class="label">PIC User:</span>
            <span class="value">{{ $transaction->user->name }}</span>
        </div>
    </div>

    <div class="service-detail">
        <h4>Detail Layanan:</h4>
        <p>{{ $transaction->service_detail }}</p>
    </div>

    @if ($transaction->notes)
        <div class="service-detail">
            <h4>Catatan:</h4>
            <p>{{ $transaction->notes }}</p>
        </div>
    @endif

    <div class="total-section">
        <div class="total-amount">
            Total: Rp {{ number_format($transaction->total_price, 0, ',', '.') }}
        </div>
    </div>

    <div class="footer">
        <p>Dokumen ini dibuat secara otomatis pada {{ now()->format('d/m/Y H:i:s') }}</p>
        <p>SistemDekor - Solusi Dekorasi Terpercaya</p>
    </div>
</body>

</html>
