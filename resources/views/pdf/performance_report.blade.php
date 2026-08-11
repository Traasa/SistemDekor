<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kinerja</title>
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
        <h1>Ade Decoration</h1>
        <h2>Laporan Kinerja Karyawan & Vendor</h2>
        <p>{{ \Carbon\Carbon::parse($startDate)->format('l, F d, Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('l, F d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nama Karyawan/Vendor</th>
                <th>Posisi</th>
                <th>Departemen</th>
                <th class="text-right">Total Penugasan</th>
                <th class="text-right">Penugasan Selesai</th>
                <th class="text-right">Tingkat Penyelesaian (%)</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @php
                $sumTotalAssignments = 0;
                $sumCompletedAssignments = 0;
            @endphp
            
            @foreach($employees as $employee)
                @php
                    $totalAssignments = $employee->assignments->count();
                    $completedAssignments = $employee->assignments->where('status', 'completed')->count();
                    $completionRate = $totalAssignments > 0 
                        ? round(($completedAssignments / $totalAssignments) * 100, 2) 
                        : 0;
                        
                    $sumTotalAssignments += $totalAssignments;
                    $sumCompletedAssignments += $completedAssignments;
                @endphp
                <tr>
                    <td>{{ $employee->name }}</td>
                    <td>{{ $employee->position ?? 'N/A' }}</td>
                    <td>{{ $employee->department ?? 'N/A' }}</td>
                    <td class="text-right">{{ number_format($totalAssignments, 0) }}</td>
                    <td class="text-right">{{ number_format($completedAssignments, 0) }}</td>
                    <td class="text-right">{{ number_format($completionRate, 2) }}%</td>
                    <td class="text-center">{{ ucfirst($employee->status ?? 'active') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            @php
                $avgCompletionRate = $sumTotalAssignments > 0 
                    ? round(($sumCompletedAssignments / $sumTotalAssignments) * 100, 2) 
                    : 0;
            @endphp
            <tr class="total-row">
                <td colspan="3" class="text-right">Total Keseluruhan :</td>
                <td class="text-right">{{ number_format($sumTotalAssignments, 0) }}</td>
                <td class="text-right">{{ number_format($sumCompletedAssignments, 0) }}</td>
                <td class="text-right">{{ number_format($avgCompletionRate, 2) }}%</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

</body>
</html>
