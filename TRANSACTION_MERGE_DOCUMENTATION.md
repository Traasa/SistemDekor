# Dokumentasi Penggabungan Menu Transaksi & Order

## Perubahan yang Dilakukan

### 1. Frontend Changes

#### OrdersPage.tsx

- **Lokasi**: `resources/js/pages/admin/OrdersPage.tsx`
- **Perubahan**:
    - Menambahkan 3 tab: "Semua Order", "Bukti Pembayaran", dan "Riwayat Pembayaran"
    - Menggabungkan fitur dari halaman Pembayaran dan Invoice ke dalam satu halaman
    - Menambahkan fungsi `fetchPayments()` dan `fetchPaymentProofs()`
    - Menambahkan fungsi `handleVerifyProof()` dan `handleRejectProof()`
    - Menambahkan helper functions: `getStatusBadge()`, `getPaymentTypeBadge()`, `formatCurrency()`, `formatDate()`
    - Menampilkan data dengan field yang benar: `final_price`, `order_number`, `deposit_amount`

#### AdminLayout.tsx

- **Lokasi**: `resources/js/layouts/AdminLayout.tsx`
- **Perubahan**:
    - Menghapus menu "Pembayaran" dan "Invoice" dari submenu "Transaksi & Order"
    - Menyisakan hanya 2 submenu: "Semua Order" dan "Laporan Keuangan"

### 2. Backend Changes

#### PaymentController.php

- **Lokasi**: `app/Http/Controllers/PaymentController.php`
- **Perubahan**:
    - Menambahkan method `index()` untuk mengambil daftar payment proofs
    - Transformasi data untuk memastikan menggunakan field yang benar:
        - `final_price` (bukan `total_price`)
        - `order_number` (sudah ada di Order model)
        - `deposit_amount` (dari order)
    - Menambahkan pagination (15 items per page)
    - Menambahkan filter status dan search

#### PaymentTransactionController.php

- **Lokasi**: `app/Http/Controllers/Api/PaymentTransactionController.php`
- **Perubahan**:
    - Update method `index()` untuk mengembalikan data dengan field yang benar
    - Menambahkan pagination (15 items per page)
    - Transformasi data order untuk menggunakan `final_price` dan field terbaru
    - Filter status dan payment_type mempertimbangkan nilai 'all'

#### Routes

- **Lokasi**: `routes/web.php`
- **Perubahan**:
    - Menambahkan route: `GET /admin/payment-proofs` → `PaymentController@index`

### 3. Database Migration

#### update_orders_status_enum_values

- **File**: `database/migrations/2025_11_24_054654_update_orders_status_enum_values.php`
- **Perubahan**:
    - Update ENUM `status` dengan 10 nilai baru:
        - `pending_confirmation`, `negotiation`, `awaiting_dp_payment`, `dp_paid`
        - `awaiting_full_payment`, `paid`, `confirmed`, `processing`, `completed`, `cancelled`
    - Update ENUM `payment_status` dengan 6 nilai:
        - `unpaid`, `dp_pending`, `dp_paid`, `full_pending`, `paid`, `partial`

## Fitur yang Tersedia di Tab Baru

### Tab 1: Semua Order

- Menampilkan semua order dengan OrderTable component
- Filter status order
- Search order
- OrderStats component
- Actions: Edit, Delete, View Detail, Change Status

### Tab 2: Bukti Pembayaran

- Menampilkan semua payment proofs yang diupload client
- Kolom: Order #, Client, Jumlah, Tipe (DP/Pelunasan), Status, Tanggal Upload, Bukti, Aksi
- Filter status: pending, verified, rejected
- Actions: Verifikasi (✓), Tolak (✕)
- Link untuk melihat bukti pembayaran
- Auto-update order status setelah verifikasi

### Tab 3: Riwayat Pembayaran

- Menampilkan semua payment transactions
- Kolom: Order #, Client, Event, Jumlah, Tipe, Metode, Status, Tanggal
- Read-only view (tidak ada action)
- Menampilkan order status di setiap row

## Data Fields yang Digunakan

### Order Model

- `order_number`: Nomor order unik
- `final_price`: Harga final setelah diskon (digunakan di semua tempat)
- `total_price`: Harga sebelum diskon (fallback jika final_price null)
- `deposit_amount`: Jumlah DP yang sudah dibayar
- `remaining_amount`: Sisa pembayaran
- `status`: Status order (10 nilai)
- `payment_status`: Status pembayaran (6 nilai)

### PaymentProof Model

- `amount`: Jumlah yang dibayar
- `payment_type`: 'dp' atau 'full'
- `proof_image_path`: Path ke bukti pembayaran
- `status`: 'pending', 'verified', 'rejected'
- `verified_by`: User ID admin yang verifikasi
- `verified_at`: Waktu verifikasi

### PaymentTransaction Model

- `amount`: Jumlah transaksi
- `payment_type`: 'dp', 'full', 'installment'
- `payment_method`: 'cash', 'transfer', 'credit_card', 'debit_card'
- `payment_date`: Tanggal pembayaran
- `status`: 'pending', 'verified', 'rejected'

## API Endpoints

### GET /admin/payment-proofs

**Response:**

```json
{
  "success": true,
  "data": [...],
  "current_page": 1,
  "last_page": 3,
  "per_page": 15,
  "total": 45
}
```

### GET /api/payment-transactions

**Response:**

```json
{
  "success": true,
  "data": [...],
  "current_page": 1,
  "last_page": 2,
  "per_page": 15,
  "total": 30
}
```

### POST /admin/payment-proofs/{id}/verify

**Request:**

```json
{
    "admin_notes": "Payment verified successfully"
}
```

### POST /admin/payment-proofs/{id}/reject

**Request:**

```json
{
    "rejection_reason": "Invalid proof image"
}
```

## Testing Checklist

- [ ] Tab navigation berfungsi dengan baik
- [ ] Tab "Semua Order" menampilkan semua order
- [ ] Tab "Bukti Pembayaran" menampilkan payment proofs dengan benar
- [ ] Tab "Riwayat Pembayaran" menampilkan payment transactions
- [ ] Filter status berfungsi di setiap tab
- [ ] Search berfungsi di setiap tab
- [ ] Verifikasi payment proof berhasil dan update order status
- [ ] Reject payment proof berhasil dan reactivate payment link
- [ ] Currency formatting menggunakan format IDR
- [ ] Date formatting menggunakan format Indonesia
- [ ] Nilai final_price, deposit_amount, remaining_amount sesuai
- [ ] Order number ditampilkan dengan benar
- [ ] Status badges menggunakan warna yang tepat
- [ ] Payment type badges menggunakan warna yang tepat
- [ ] Pagination berfungsi di setiap tab
- [ ] Image bukti pembayaran bisa dibuka di tab baru

## Migration Commands

```bash
# Run migration
php artisan migrate

# Rollback jika perlu
php artisan migrate:rollback

# Refresh database (hapus semua data)
php artisan migrate:fresh --seed
```

## Build Commands

```bash
# Development
npm run dev

# Production
npm run build
```

## Status Workflow

### Order Status Flow:

1. `pending_confirmation` → Order baru dibuat
2. `negotiation` → Dalam proses negosiasi (is_negotiable = true)
3. `awaiting_dp_payment` → Menunggu client bayar DP
4. `dp_paid` → DP terverifikasi
5. `awaiting_full_payment` → Menunggu pelunasan
6. `paid` → Sudah lunas
7. `confirmed` → Admin konfirmasi order
8. `processing` → Sedang dikerjakan
9. `completed` → Selesai
10. `cancelled` → Dibatalkan

### Payment Status Flow:

1. `unpaid` → Belum ada pembayaran
2. `dp_pending` → DP diupload, menunggu verifikasi
3. `dp_paid` → DP terverifikasi
4. `full_pending` → Pelunasan diupload, menunggu verifikasi
5. `paid` → Lunas terverifikasi
6. `partial` → Bayar sebagian (cicilan)

## Notes

- Menu "Pembayaran" dan "Invoice" sudah dihapus dari sidebar
- Semua fitur pembayaran dan invoice sekarang ada di halaman "Transaksi & Order"
- Data yang ditampilkan sudah menggunakan field terbaru dari database
- Status badges menggunakan warna yang konsisten dengan sistem baru
- Pagination diterapkan di semua tab untuk performa yang lebih baik
