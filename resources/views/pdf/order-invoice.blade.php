<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number ?? ('ORD-' . $order->id) }}</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2933; line-height: 1.4; }
        
        /* Layout Dasar Menggunakan Tabel */
        .w-full { width: 100%; }
        .borderless-table { width: 100%; border-collapse: collapse; }
        .borderless-table td { border: none; padding: 0; vertical-align: top; }
        
        /* Header & Meta */
        .header-container { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
        .brand { font-size: 22px; font-weight: bold; color: #b88a4a; letter-spacing: 0.5px; }
        .meta-title { font-size: 16px; font-weight: bold; color: #1f2933; text-transform: uppercase; margin-bottom: 4px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Typography & Utilities */
        .section-title { font-size: 13px; font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; }
        .muted { color: #6b7280; }
        .bold { font-weight: bold; }
        
        /* Tabel Data / Manifes */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; }
        .data-table th { background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 6px 8px; font-weight: bold; color: #374151; text-align: left; }
        .data-table td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        
        /* Blok Informasi Klien & Acara */
        .info-cell { width: 48%; }
        .info-spacer { width: 4%; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 3px 0; font-size: 11px; }
        .info-label { width: 30%; color: #6b7280; }
        .info-value { width: 70%; }

        /* Blok Ringkasan Finansial */
        .summary-wrapper { width: 100%; margin-top: 15px; }
        .summary-table { width: 40%; margin-left: auto; border-collapse: collapse; }
        .summary-table td { padding: 4px 8px; text-align: right; }
        .summary-table .label { text-align: left; color: #6b7280; }
        .summary-table .total-row { font-size: 13px; font-weight: bold; color: #b88a4a; background-color: #fdfbf7; border-top: 1px solid #e5e7eb; }
        
        /* Badge Status */
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background-color: #f3f4f6; color: #374151; text-transform: uppercase; }
        .badge-success { background-color: #dcfce7; color: #166534; font-weight: bold; border: 1px solid #bbf7d0; }
        .badge-warning { background-color: #fef3c7; color: #92400e; font-weight: bold; border: 1px solid #fde68a; }
        
        .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 10px; }
    </style>
</head>
<body>

    <!-- HEADER SECTION USING TABLE LAYOUT -->
    <div class="header-container">
        <table class="borderless-table">
            <tr>
                <td>
                    <div class="brand">Ade Decoration</div>
                    <div class="muted" style="font-size: 12px; margin-top: 2px;">Wedding Organizer & Decoration</div>
                </td>
                <td class="text-right">
                    <div class="meta-title">Invoice</div>
                    <div><span class="muted">No:</span> <span class="bold">{{ $order->order_number ?? ('ORD-' . $order->id) }}</span></div>
                    <div class="muted">Tanggal: {{ optional($order->created_at)->format('d M Y') }}</div>
                    <div>
                        <span class="muted">Status:</span> 
                        @if(($order->payment_status ?? '-') === 'LUNAS' || ($order->payment_status ?? '-') === 'verified')
                            <span class="badge badge-success">LUNAS</span>
                        @else
                            <span class="badge badge-warning">{{ $order->payment_status ?? '-' }}</span>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- CLIENT AND EVENT INFO USING SIDE-BY-SIDE TABLES -->
    <table class="borderless-table" style="margin-bottom: 10px;">
        <tr>
            <!-- Data Klien -->
            <td class="info-cell">
                <div class="section-title">Data Klien</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Nama</td>
                        <td class="info-value">: {{ $order->client->name ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Email</td>
                        <td class="info-value">: {{ $order->client->email ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Telepon</td>
                        <td class="info-value">: {{ $order->client->phone ?? '-' }}</td>
                    </tr>
                </table>
            </td>
            
            <!-- Spacer -->
            <td class="info-spacer"></td>
            
            <!-- Detail Acara -->
            <td class="info-cell">
                <div class="section-title">Detail Acara</div>
                <table class="info-table">
                    <tr>
                        <td class="info-label">Acara</td>
                        <td class="info-value">: {{ $order->event_name ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Tanggal</td>
                        <td class="info-value">: {{ optional($order->event_date)->format('d M Y') ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Lokasi</td>
                        <td class="info-value">: {{ $order->event_location ?? $order->event_address ?? '-' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- ORDER DETAILS TABLE -->
    <div class="section-title">Rincian Pesanan</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 22%; text-align: right;">Harga</th>
                <th style="width: 23%; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->orderDetails as $detail)
                <tr>
                    <td>{{ $detail->item_name }}</td>
                    <td class="text-center">{{ $detail->quantity }}</td>
                    <td class="text-right">Rp {{ number_format($detail->cost ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($detail->subtotal ?? 0, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    @php
                        $fallbackPrice = $order->package->base_price
                            ?? $order->total_price
                            ?? $order->final_price
                            ?? 0;
                    @endphp
                    <td>Paket {{ $order->package->name ?? 'Custom Package' }}</td>
                    <td class="text-center">1</td>
                    <td class="text-right">Rp {{ number_format($fallbackPrice, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($fallbackPrice, 0, ',', '.') }}</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- FIRST FINANCIAL SUMMARY (RIGHT ALIGNED) -->
    <table class="borderless-table summary-wrapper">
        <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%;">
                <table class="summary-table w-full">
                    <tr>
                        <td class="label">Total Harga</td>
                        <td>Rp {{ number_format($order->total_price ?? 0, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="label">Diskon</td>
                        <td>Rp {{ number_format($order->discount ?? 0, 0, ',', '.') }}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="label bold" style="color: #b88a4a;">Total Bayar</td>
                        <td class="bold">Rp {{ number_format($order->final_price ?? 0, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    @php
        $paymentProofs = $order->paymentProofs ?? collect();
        $paymentLabels = [
            'booking' => 'Booking Fee',
            'dp' => 'Down Payment (DP)',
            'installment' => 'Cicilan',
            'full' => 'Pelunasan',
        ];
        $installmentIndex = 1;
        $finalPrice = $order->final_price ?? 0;
        $defaultDp = (int) round($finalPrice * 0.3);
        $defaultInstallment = (int) round($finalPrice * 0.4);
        $defaultFull = max($finalPrice - $defaultDp - $defaultInstallment, 0);
        $totalPaid = $order->total_paid ?? 0;
        $remainingPayment = $order->remaining_payment ?? 0;
    @endphp

    <!-- PAYMENT TERMINS TABLE -->
    <div class="section-title" style="margin-top: 25px;">Jadwal & Status Termin Pembayaran</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 40%;">Termin Pembayaran</th>
                <th style="width: 25%; text-align: right;">Nominal</th>
                <th style="width: 20%; text-align: center;">Tanggal</th>
                <th style="width: 15%; text-align: center;">Status</th>
            </tr>
        </thead>
        <tbody>
            @if($paymentProofs->isNotEmpty())
                @foreach($paymentProofs as $proof)
                    @php
                        $label = $paymentLabels[$proof->payment_type] ?? 'Pembayaran';
                        if ($proof->payment_type === 'installment') {
                            $label .= ' ' . $installmentIndex;
                            $installmentIndex++;
                        }
                        $isVerified = $proof->status === 'verified';
                        $statusText = $isVerified ? 'LUNAS' : ($proof->status === 'rejected' ? 'DITOLAK' : 'MENUNGGU');
                    @endphp
                    <tr>
                        <td>{{ $loop->iteration }}. {{ $label }}</td>
                        <td class="text-right">Rp {{ number_format($proof->amount ?? 0, 0, ',', '.') }}</td>
                        <td class="text-center">{{ optional($proof->verified_at ?? $proof->created_at)->format('d M Y') ?? '-' }}</td>
                        <td class="text-center">
                            <span class="badge {{ $isVerified ? 'badge-success' : '' }}">
                                {{ $statusText }}
                            </span>
                        </td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td>1. Down Payment (DP) 30%</td>
                    <td class="text-right">Rp {{ number_format($defaultDp, 0, ',', '.') }}</td>
                    <td class="text-center">-</td>
                    <td class="text-center"><span class="badge">BELUM</span></td>
                </tr>
                <tr>
                    <td>2. Cicilan 1 (Sesi 2) 40%</td>
                    <td class="text-right">Rp {{ number_format($defaultInstallment, 0, ',', '.') }}</td>
                    <td class="text-center">-</td>
                    <td class="text-center"><span class="badge">BELUM</span></td>
                </tr>
                <tr>
                    <td>3. Pelunasan (Sesi 3) 30%</td>
                    <td class="text-right">Rp {{ number_format($defaultFull, 0, ',', '.') }}</td>
                    <td class="text-center">-</td>
                    <td class="text-center"><span class="badge">BELUM</span></td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- FINAL BILLING SUMMARY (RIGHT ALIGNED) -->
    <table class="borderless-table summary-wrapper" style="margin-top: 10px;">
        <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%;">
                <table class="summary-table w-full">
                    <tr>
                        <td class="label">Total Dibayar</td>
                        <td>Rp {{ number_format($totalPaid, 0, ',', '.') }}</td>
                    </tr>
                    <tr class="total-row" style="background-color: #fbfbfe;">
                        <td class="label bold" style="color: #1f2933;">Sisa Tagihan</td>
                        <td class="bold" style="color: #1f2933;">Rp {{ number_format($remainingPayment, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- FOOTER -->
    <div class="footer">
        Invoice ini dibuat otomatis oleh Ade Decoration. Silakan hubungi admin bila ada pertanyaan.
    </div>

</body>
</html>