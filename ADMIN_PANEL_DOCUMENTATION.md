# Admin Panel - Diamond Weddings

## Overview

Admin panel yang lengkap dan mudah digunakan untuk mengelola seluruh operasional wedding organizer.

---

## Struktur Menu Admin

### 📊 Dashboard

- Overview statistics (Total Order, Revenue, Active Events, Low Stock)
- Quick Actions (Buat Order, Tambah Client, Stock In, Lihat Laporan)
- Recent Orders dengan status tracking
- Upcoming Events timeline
- Alert cards (Low Stock, Pending Payments, Active Vendors)

### 👥 Manajemen User

- ✅ **Daftar User** - List semua user dengan filter role
- 🔐 **Role & Permission** - Manage roles (admin, sales, user)
- 📈 **User Activity** - Track user activity logs

### 🌐 Website Content

- 🏢 **Company Profile** - Edit informasi perusahaan
- ⚙️ **Services** - Kelola daftar layanan
- 🖼️ **Gallery** - Kelola foto-foto gallery
- 💬 **Testimonials** - Kelola testimoni client
- 📦 **Packages** - Kelola paket wedding
- 🎨 **Portfolio** - Kelola portfolio proyek

### 📦 Inventaris

- ✅ **Kategori** - Kelola kategori barang
- ✅ **Daftar Barang** - CRUD items dengan view grid/list
- 📊 **Stock In/Out** - Transaction history
- ⚠️ **Low Stock Alert** - Notifikasi barang yang stock-nya menipis

### 💰 Transaksi & Order

- 📋 **Semua Order** - List semua pesanan
- 💳 **Pembayaran** - Track pembayaran (DP/Pelunasan)
- 🧾 **Invoice** - Generate & manage invoices
- 📊 **Laporan Keuangan** - Financial reports

### 🎉 Event & Rundown

- 📅 **Daftar Event** - List semua event
- 📝 **Rundown Acara** - Timeline & schedule event
- ✅ **Task Assignment** - Assign task ke karyawan
- 📆 **Kalender Event** - Calendar view

### 🏛️ Venue

- 📋 **Daftar Venue** - Kelola venue
- 📅 **Ketersediaan** - Check venue availability
- 💵 **Pricing** - Manage harga venue

### 👔 Karyawan

- 📋 **Daftar Karyawan** - Employee database
- 🕐 **Jadwal Kerja** - Work schedules
- 📌 **Penugasan** - Task assignments
- ✓ **Absensi** - Attendance tracking

### 🤝 Vendor

- 📋 **Daftar Vendor** - Vendor directory
- 🗂️ **Kategori Vendor** - Vendor categories
- 📄 **Kontrak** - Manage contracts
- ⭐ **Rating & Review** - Vendor ratings

### 👰 Clients

- 📋 **Daftar Client** - Client database
- 🔍 **Verifikasi Order** - Order verification tokens

### 📊 Laporan

- 💰 **Laporan Penjualan** - Sales reports
- 📦 **Laporan Inventaris** - Inventory reports
- 📈 **Laporan Kinerja** - Performance reports
- 📥 **Export Data** - Export to Excel/PDF

### ⚙️ Pengaturan

- 🔧 **Pengaturan Umum** - General settings
- 🔔 **Notifikasi** - Notification preferences
- 📧 **Email Templates** - Email template editor
- 💾 **Backup & Restore** - Database backup

---

## Features yang Sudah Diimplementasi

### ✅ AdminLayout Component

- **Collapsible Sidebar** dengan tombol toggle
- **Nested Menu** dengan expand/collapse
- **Active State** untuk menu yang sedang dibuka
- **Badge Notification** untuk menu dengan notifikasi
- **User Profile** di bottom sidebar dengan logout button
- **Top Header** dengan notifications & messages icon
- **Responsive Design** mobile-friendly

### ✅ Dashboard Page

- **4 Stat Cards** dengan gradient icons
- **Quick Actions** buttons dengan warna berbeda
- **Recent Orders Table** dengan status badges
- **Upcoming Events Timeline**
- **Alert Cards** (Low Stock, Pending Payments, Active Vendors)

### ✅ Users Management Page

- **Search & Filter** by name, email, role
- **User Table** dengan avatar, role badge, status
- **Stats Overview** (Total Users, Active Users, Admin/Sales count)
- **CRUD Actions** (Edit, Delete buttons)

### ✅ Inventory Items Page

- **Grid & List View** toggle
- **Search & Multiple Filters** (category, stock status)
- **Stock Status Badges** (In Stock, Low Stock, Out of Stock)
- **Condition Indicator** (good, fair, poor)
- **Quick Actions** (Detail, Stock In, Stock Out)
- **Stats Cards** (Total Items, Total Stock, Low Stock, Total Value)

---

## Design System

### Color Palette

- **Primary Gold**: `#D4AF37` - Buttons, active states, highlights
- **Secondary Pink**: `#EC4899` - Accent colors, badges
- **Gray Scale**:
    - Dark: `#1F2937` - Sidebar background
    - Medium: `#6B7280` - Text secondary
    - Light: `#F3F4F6` - Backgrounds

### Typography

- **Headings**: Font Bold, large sizes
- **Body**: Font Medium/Regular
- **Serif Font**: Playfair Display for branding

### Components

- **Rounded Corners**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full` (circular)
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Transitions**: All hover states dengan smooth transition
- **Icons**: Emoji-based untuk lightweight & colorful UI

---

## Status Implementation

| Module               | Status                | Notes                                      |
| -------------------- | --------------------- | ------------------------------------------ |
| Dashboard            | ✅ Completed          | Full featured dengan stats & quick actions |
| Admin Layout         | ✅ Completed          | Collapsible sidebar dengan nested menus    |
| User Management      | ✅ Completed          | Table view dengan search & filters         |
| Inventory Items      | ✅ Completed          | Grid/List view, stock management           |
| Website Content      | 🚧 Under Construction | Placeholder pages                          |
| Transaction & Orders | 🚧 Under Construction | Placeholder pages                          |
| Event & Rundown      | 🚧 Under Construction | Placeholder pages                          |
| Venue Management     | 🚧 Under Construction | Placeholder pages                          |
| Employee Management  | 🚧 Under Construction | Placeholder pages                          |
| Vendor Management    | 🚧 Under Construction | Placeholder pages                          |
| Clients              | 🚧 Under Construction | Placeholder pages                          |
| Reports              | 🚧 Under Construction | Placeholder pages                          |
| Settings             | 🚧 Under Construction | Placeholder pages                          |

---

## How to Use

### Login as Admin

```
Email: admin@diamond.com
Password: [your admin password]
```

### Navigate Admin Panel

1. Click hamburger menu (◀/▶) untuk collapse/expand sidebar
2. Click menu dengan children untuk expand submenu
3. Active page akan di-highlight dengan warna gold
4. Notifications & messages tersedia di top header
5. User profile & logout button di bottom sidebar

### Quick Actions dari Dashboard

- **Buat Order Baru** → Langsung ke form order
- **Tambah Client** → Form tambah client baru
- **Stock In** → Quick stock in untuk inventory
- **Lihat Laporan** → Jump ke sales report

---

## Next Development Steps

1. **Backend Integration**
    - Connect API untuk semua CRUD operations
    - Real-time data dari database
    - Authentication & authorization

2. **Additional Pages**
    - Complete all "Under Construction" modules
    - Form pages untuk Create/Edit
    - Detail pages untuk View

3. **Advanced Features**
    - Real-time notifications dengan websockets
    - Export to Excel/PDF
    - Dashboard charts dengan Chart.js
    - Calendar view untuk events
    - Drag & drop untuk task assignments

4. **Optimizations**
    - Loading states & skeletons
    - Error handling & validation
    - Pagination untuk large datasets
    - Image upload & preview

---

## File Structure

```
resources/js/
├── layouts/
│   └── AdminLayout.tsx          # Main admin layout dengan sidebar
├── pages/
│   └── admin/
│       ├── Dashboard.tsx        # Dashboard overview
│       ├── UsersPage.tsx        # User management
│       └── InventoryItemsPage.tsx  # Inventory items
└── app.tsx                      # Main routing
```

---

## Technologies Used

- **React 18** - UI Framework
- **React Router 6** - Client-side routing
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Laravel 11** - Backend API

---

## Support & Contact

Untuk pertanyaan atau bantuan, hubungi tim development.
