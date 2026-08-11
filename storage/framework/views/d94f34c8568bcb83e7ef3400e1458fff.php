<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kontrak <?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1f2933; line-height: 1.5; padding: 10px; }
        
        /* Header Branding */
        .brand { font-size: 22px; font-weight: bold; color: #8a6a4f; text-transform: uppercase; letter-spacing: 0.5px; }
        .brand-sub { color: #6b7280; font-size: 12px; margin-top: 2px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        
        /* Judul Dokumen */
        .title { font-size: 15px; font-weight: bold; text-align: center; margin-top: 20px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .doc-number { text-align: center; color: #4b5563; font-size: 11px; margin-bottom: 25px; }
        
        /* Struktur Pasal & Sub-judul */
        .section-title { font-size: 12px; font-weight: bold; color: #1f2933; margin-top: 20px; margin-bottom: 6px; text-transform: uppercase; }
        p { margin-top: 0; margin-bottom: 10px; text-align: justify; }
        ol { margin-top: 0; margin-bottom: 10px; padding-left: 20px; text-align: justify; }
        li { margin-bottom: 4px; }
        
        /* Tabel Data Pihak & Detail (Pengganti Flexbox) */
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; margin-left: 10px; }
        .data-table td { padding: 4px 0; vertical-align: top; font-size: 11px; }
        .data-table .label { width: 25%; color: #4b5563; }
        .data-table .colon { width: 3%; text-align: center; color: #1f2933; }
        .data-table .value { width: 72%; color: #1f2933; font-weight: 500; }
        
        /* Blok Tanda Tangan */
        .signature-container { width: 100%; margin-top: 35px; border-collapse: collapse; page-break-inside: avoid; }
        .signature-container td { width: 50%; text-align: center; vertical-align: top; font-size: 11px; }
        .signature-space { height: 75px; }
        .signature-line { border-top: 1px solid #4b5563; width: 70%; margin: 0 auto; padding-top: 6px; font-weight: bold; color: #1f2933; }
        .signature-role { font-size: 10px; color: #6b7280; margin-top: 2px; }
    </style>
</head>
<body>

    <div class="brand">Ade Decoration</div>
    <div class="brand-sub">Wedding Organizer & Decoration</div>

    <div class="title">Surat Kontrak Kerja Sama (MOU)</div>
    <div class="doc-number">Nomor Kontrak: <strong><?php echo e($order->order_number ?? ('ORD-' . $order->id)); ?></strong></div>

    <p>Pada hari ini, <strong><?php echo e(optional($order->created_at)->format('d M Y') ?? '-'); ?></strong>, yang bertandatangan di bawah ini secara sadar dan tanpa paksaan dari pihak mana pun, menyepakati ikatan kerja sama antara:</p>

    <p><strong>1. PIHAK PERTAMA (Vendor)</strong></p>
    <table class="data-table">
        <tr>
            <td class="label">Nama Perusahaan</td>
            <td class="colon">:</td>
            <td class="value">Ade Decoration</td>
        </tr>
        <tr>
            <td class="label">Perwakilan</td>
            <td class="colon">:</td>
            <td class="value">Edom</td>
        </tr>
        <tr>
            <td class="label">Jabatan</td>
            <td class="colon">:</td>
            <td class="value">Owner Ade Decoration</td>
        </tr>
        <tr>
            <td class="label">Alamat</td>
            <td class="colon">:</td>
            <td class="value">Jl. H. Saidi, Tanjung Barat, Jakarta Selatan</td>
        </tr>
    </table>

    <p><strong>2. PIHAK KEDUA</strong></p>
    <table class="data-table">
        <tr>
            <td class="label">Nama Klien</td>
            <td class="colon">:</td>
            <td class="value"><?php echo e($order->client->name ?? '-'); ?></td>
        </tr>
        <tr>
            <td class="label">No. KTP</td>
            <td class="colon">:</td>
            <td class="value">-</td>
        </tr>
        <tr>
            <td class="label">No. Telepon</td>
            <td class="colon">:</td>
            <td class="value"><?php echo e($order->client->phone ?? '-'); ?></td>
        </tr>
        <tr>
            <td class="label">Alamat Lengkap</td>
            <td class="colon">:</td>
            <td class="value"><?php echo e($order->client->address ?? '-'); ?></td>
        </tr>
    </table>

    <p>Kedua belah pihak dengan ini sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama pelaksanaan acara pernikahan dengan ketentuan dan syarat yang diatur dalam pasal-pasal berikut:</p>

    <div class="section-title">PASAL 1: RUANG LINGKUP PEKERJAAN</div>
    <p>PIHAK PERTAMA berkewajiban untuk menyediakan, mempersiapkan, dan melaksanakan layanan Wedding Organizer & Decoration sesuai dengan spesifikasi paket <strong>"Paket <?php echo e($order->package->name ?? 'Custom Package'); ?>"</strong> yang telah dipilih dan disetujui oleh PIHAK KEDUA.</p>

    <div class="section-title">PASAL 2: WAKTU DAN TEMPAT PELAKSANAAN</div>
    <p>Acara pernikahan yang dimaksud dalam kontrak ini akan dilaksanakan penuh pada:</p>
    <table class="data-table">
        <tr>
            <td class="label">Hari / Tanggal</td>
            <td class="colon">:</td>
            <td class="value"><?php echo e(optional($order->event_date)->format('d M Y') ?? '-'); ?></td>
        </tr>
        <tr>
            <td class="label">Waktu Acara</td>
            <td class="colon">:</td>
            <td class="value">[Jam Acara] s.d Selesai</td>
        </tr>
        <tr>
            <td class="label">Lokasi / Venue</td>
            <td class="colon">:</td>
            <td class="value"><?php echo e($order->event_location ?? $order->event_address ?? '-'); ?></td>
        </tr>
    </table>

    <div class="section-title">PASAL 3: NILAI KONTRAK & SKEMA PEMBAYARAN</div>
    <ol>
        <li>Total nilai kontrak biaya pernikahan yang disepakati oleh kedua belah pihak adalah sebesar <strong>Rp <?php echo e(number_format($order->final_price ?? 0, 0, ',', '.')); ?></strong>.</li>
        <li>Sistem pembayaran wajib diselesaikan secara disiplin oleh PIHAK KEDUA melalui termin berikut:
            <ol type="a">
                <li><strong>Uang Muka (DP)</strong> dibayarkan pada saat penandatanganan surat perjanjian kerja sama ini.</li>
                <li><strong>Cicilan Bertahap</strong> dibayarkan sesuai dengan tanggal yang disepakati bersama oleh kedua belah pihak.</li>
                <li><strong>Pelunasan Sisa Pembayaran</strong> wajib dilunasi paling lambat H-14 sebelum tanggal pelaksanaan acara.</li>
            </ol>
        </li>
        <li>Setiap keterlambatan pembayaran termin dari batas jatuh tempo yang telah disepakati akan dikenakan sanksi denda sebesar 1% per hari dihitung dari nilai tagihan termin berjalan.</li>
    </ol>

    <div class="section-title">PASAL 4: HAK DAN KEWAJIBAN PIHAK PERTAMA</div>
    <ol>
        <li>PIHAK PERTAMA berhak penuh untuk menerima pembayaran tepat waktu dari PIHAK KEDUA sesuai dengan ketentuan skema pada Pasal 3.</li>
        <li>PIHAK PERTAMA berkewajiban mempersiapkan, menyediakan seluruh properti dekorasi, serta memimpin kru pelaksana lapangan sesuai dengan standar paket yang disepakati dengan kualitas terbaik pada hari pelaksanaan acara.</li>
    </ol>

    <div class="section-title">PASAL 5: HAK DAN KEWAJIBAN PIHAK KEDUA</div>
    <ol>
        <li>PIHAK KEDUA berhak mendapatkan seluruh rincian fasilitas serta pelayanan profesional dari paket "Paket <?php echo e($order->package->name ?? 'Custom Package'); ?>".</li>
        <li>PIHAK KEDUA berkewajiban melengkapi dan memberikan data konfirmasi teknis terkait detail acara secara akurat kepada PIHAK PERTAMA selambat-lambatnya H-30 sebelum acara dimulai.</li>
    </ol>

    <div class="section-title">PASAL 6: KEBIJAKAN PEMBATALAN DAN PERUBAHAN JADWAL</div>
    <ol>
        <li>Apabila terjadi pembatalan kerja sama sepihak oleh PIHAK KEDUA dengan alasan apa pun, seluruh dana Uang Muka (DP) yang telah masuk ke pihak PIHAK PERTAMA dinyatakan hangus dan tidak dapat dikembalikan.</li>
        <li>Pembatalan sepihak yang dilakukan oleh PIHAK KEDUA dalam kurun waktu H-14 hingga hari pelaksanaan acara, mewajibkan PIHAK KEDUA untuk membayar ganti rugi pemenuhan material sebesar 80% dari total nilai kontrak keseluruhan.</li>
        <li>Permohonan perubahan tanggal acara (*rescheduling*) wajib diinformasikan oleh PIHAK KEDUA secara tertulis kepada PIHAK PERTAMA maksimal H-60 sebelum acara, serta wajib menyesuaikan dengan ketersediaan jadwal kosong milik PIHAK PERTAMA.</li>
    </ol>

    <div class="section-title">PASAL 7: FORCE MAJEURE (KEADAAN MEMAKSA)</div>
    <p>Apabila acara pernikahan gagal dilaksanakan akibat terjadinya keadaan memaksa di luar kendali manusia seperti bencana alam, perang, huru-hara massal, epidemi global, atau adanya pembatasan ketat dari kebijakan pemerintah pusat/daerah, maka kedua belah pihak sepakat menyelesaikan sengketa secara musyawarah mufakat demi kebaikan bersama tanpa dikenakan denda sepihak.</p>

    <div class="section-title">PASAL 8: PENYELESAIAN PERSELISIHAN</div>
    <p>Segala bentuk perselisihan yang mungkin timbul akibat penafsiran pelaksanaan surat kontrak kerja sama ini akan diselesaikan terlebih dahulu secara kekeluargaan melalui jalur musyawarah. Apabila kata mufakat tidak tercapai, maka para pihak sepakat memilih domisili penyelesaian hukum tetap di Kantor Pengadilan Negeri Jakarta Selatan.</p>

    <p style="margin-top: 15px;">Demikian surat perjanjian kerja sama ini dibuat dalam 2 (dua) rangkap asli bermeterai cukup yang mempunyai kekuatan hukum eksekutorial yang sama, serta ditandatangan secara sadar oleh kedua belah pihak tanpa ada paksaan.</p>

    <table class="signature-container">
        <tr>
            <td>
                <div><strong>PIHAK PERTAMA</strong></div>
                <div class="signature-space"></div>
                <div class="signature-line">EDOM</div>
            </td>
            <td>
                <div><strong>PIHAK KEDUA</strong></div>
                <div class="signature-space"></div>
                <div class="signature-line"><?php echo e($order->client->name ?? '__________________'); ?></div>
            </td>
        </tr>
    </table>

</body>
</html><?php /**PATH C:\laragon\www\SistemDekor\resources\views/pdf/order-contract.blade.php ENDPATH**/ ?>