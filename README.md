# SistemDekor - Aplikasi Pencatatan Transaksi Perusahaan Dekorasi

## 📋 Deskripsi

SistemDekor adalah aplikasi web untuk mengelola transaksi dan profil perusahaan dekorasi. Aplikasi ini dibangun dengan Laravel sebagai backend API dan React sebagai frontend, dilengkapi dengan sistem autentikasi role-based dan fitur export PDF.

## �️ Teknologi yang Digunakan

### Backend

- **Laravel 12** - Framework PHP untuk API
- **Laravel Sanctum** - Autentikasi API token
- **MySQL/SQLite** - Database
- **DOMPDF** - Library untuk export PDF

### Frontend

- **React 19** - UI Library
- **React Router** - Client-side routing
- **Axios** - HTTP Client
- **TanStack Query** - State management
- **Tailwind CSS** - Styling framework
- **TypeScript** - Type safety

## 🎯 Fitur Utama

### 📋 Company Profile

- Halaman utama menampilkan profil perusahaan
- Informasi layanan, about us, kontak
- Admin dapat mengelola company profile

### 👥 Authentication & Authorization

- **Admin**: Dapat mengelola transaksi dan company profile
- **User**: Dapat melihat riwayat transaksi mereka
- **Public**: Dapat melihat company profile dan registrasi

### 💰 Transaction Management

- Admin dapat CRUD transaksi
- Assign transaksi ke user tertentu
- Status transaksi: pending, selesai, dibatalkan
- Auto-generate nomor transaksi

### 📄 Export & Share

- Export transaksi ke PDF
- Share link transaksi untuk client
- View detail transaksi tanpa login

## 🛠 Tech Stack

### Backend (Laravel)

- **Laravel 12** - PHP Framework
- **Laravel Sanctum** - API Authentication
- **MySQL/SQLite** - Database
- **DOMPDF** - PDF Generation

### Frontend (React)

- **React 19** - Frontend Framework
- **React Router** - Routing
- **Axios** - HTTP Client
- **TanStack Query** - State Management
- **Tailwind CSS** - Styling

## 📁 Struktur Project

```
SistemDekor/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── TransactionController.php
│   │   └── CompanyProfileController.php
│   └── Models/
│       ├── User.php
│       ├── Transaction.php
│       └── CompanyProfile.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   └── views/
└── routes/
    ├── api.php
    └── web.php
```

## 🚦 Setup & Installation

### Prerequisites

- PHP >= 8.2
- Node.js >= 18
- Composer
- MySQL (atau aktifkan SQLite di PHP)

### 1. Clone & Install Dependencies

```bash
cd SistemDekor
composer install
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sistem_dekor
DB_USERNAME=root
DB_PASSWORD=

# Untuk SQLite (alternatif)
# DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database.sqlite
```

### 3. Database Setup

```bash
# Buat database MySQL
mysql -u root -e "CREATE DATABASE sistem_dekor;"

# Jalankan migration
php artisan migrate

# Jalankan seeder (optional)
php artisan db:seed
```

### 4. Build & Run

```bash
# Build frontend
npm run build

# Start server
php artisan serve
```

Akses aplikasi di: `http://localhost:8000`

## 👤 Default Users (dari seeder)

### Admin

- **Email**: admin@sistemdekor.com
- **Password**: password123

### User

- **Email**: john@example.com
- **Password**: password123

## 📖 API Documentation

### Authentication

```
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
```

### Transactions (Protected)

```
GET    /api/transactions
POST   /api/transactions (Admin only)
GET    /api/transactions/{id}
PUT    /api/transactions/{id} (Admin only)
DELETE /api/transactions/{id} (Admin only)
GET    /api/transactions/{id}/pdf
```

### Company Profile

```
GET /api/company-profile (Public)
PUT /api/company-profiles/{id} (Admin only)
```

## 🎯 Penggunaan

### Sebagai Admin

1. Login dengan akun admin
2. Akses Admin Panel dari header
3. Kelola transaksi: create, edit, delete
4. Assign transaksi ke user
5. Update company profile

### Sebagai User

1. Registrasi atau login
2. Lihat "My Transactions" dari header
3. View detail transaksi
4. Export PDF atau share link

### Public/Client

1. Lihat company profile di homepage
2. Akses detail transaksi melalui share link
3. Download PDF transaksi

## 🔧 Development

### Frontend Development

```bash
npm run dev  # Hot reload development
npm run build  # Production build
```

### Backend Development

```bash
php artisan serve  # Development server
php artisan migrate:fresh --seed  # Reset database
```

### API Testing

Gunakan tools seperti Postman atau insomnia untuk test API endpoints.

## 📋 Features Checklist

- ✅ Company Profile (Public + Admin Management)
- ✅ User Authentication & Authorization
- ✅ Transaction CRUD (Admin)
- ✅ User Transaction History
- ✅ PDF Export
- ✅ Share Transaction Links
- ✅ Responsive Design
- ✅ Role-based Access Control
- ✅ Auto-generated Transaction Numbers
- ✅ Search & Filter Transactions

## 🐛 Known Issues

1. **SQLite Driver**: Jika menggunakan SQLite, pastikan ekstensi PHP SQLite aktif
2. **CORS**: Jika frontend dan backend di domain berbeda, sesuaikan config CORS
3. **PDF Fonts**: Jika ada masalah font di PDF, install font tambahan

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] File upload untuk gallery
- [ ] Payment integration
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Real-time notifications

## 📞 Support

Untuk pertanyaan dan dukungan, hubungi tim development.

---

**SistemDekor** - Professional Decoration Transaction Management System
