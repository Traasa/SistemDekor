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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        table thead {
            background-color: #dc2626;
            color: white;
        }
        table th {
            padding: 8px;
            text-align: left;
            font-weight: bold;
        }
        table td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
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
        <p>Tahun: {{ $year }}</p>
        <p>Digenerate pada: {{ $generatedAt }}</p>
    </div>

    @if(count($data['monthly_data']) > 0)
    <table>
        <thead>
            <tr>
                <th>Bulan</th>
                <th class="text-right">Revenue</th>
                <th class="text-right">Expenses</th>
                <th class="text-right">Profit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['monthly_data'] as $month)
            <tr>
                <td>{{ $month['month_name'] }}</td>
                <td class="text-right">Rp {{ number_format($month['revenue'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($month['expenses'], 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($month['profit'], 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="text-align: center; padding: 20px; color: #999;">Tidak ada data perbandingan bulanan</p>
    @endif

    <div class="footer">
        <p>Wedding Organizer - Laporan Perbandingan Bulanan</p>
        <p>Dokumen ini digenerate secara otomatis oleh sistem</p>
    </div>
</body>
</html>
