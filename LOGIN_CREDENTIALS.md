# 🔐 Login Credentials - SistemDekor

## Default User Accounts

Gunakan kredensial berikut untuk login:

### 👨‍💼 Admin Account

- **Email:** `admin@sistemdekor.com`
- **Password:** `password`
- **Role:** Admin
- **Access:** Full access ke semua fitur

### 💼 Sales Account

- **Email:** `sales@sistemdekor.com`
- **Password:** `password`
- **Role:** Sales
- **Access:** Manage orders, clients, payments

### 👤 Regular User Account

- **Email:** `user@sistemdekor.com`
- **Password:** `password`
- **Role:** User
- **Access:** View own transactions

---

## 🚀 Cara Login

1. Buka browser: http://localhost:8000
2. Klik tombol "Login" atau akses langsung: http://localhost:8000/login
3. Masukkan email dan password di atas
4. Klik "Login"

**Admin & Sales** akan diarahkan ke `/admin` (Dashboard Admin)
**User** akan diarahkan ke `/` (Homepage)

---

## 🔄 Reset Database & Seeder

Jika ingin reset database dan buat ulang user:

```bash
php artisan migrate:fresh
php artisan db:seed --class=AdminUserSeeder
```

---

## 📝 Registrasi User Baru

Untuk membuat user baru:

1. Akses: http://localhost:8000/register
2. Isi form registrasi
3. User baru akan memiliki role `user` (default)
4. Admin bisa ubah role via database atau fitur management user

---

## 🔒 Keamanan

⚠️ **PENTING**: Ganti password default sebelum deploy ke production!

```bash
# Di production, gunakan password yang kuat
php artisan tinker
>>> $user = User::where('email', 'admin@sistemdekor.com')->first();
>>> $user->password = Hash::make('YourStrongPassword123!@#');
>>> $user->save();
```

---

## 🛠️ Development Commands

```bash
# Start Laravel Server
php artisan serve

# Start Vite Dev Server (untuk hot reload)
npm run dev

# Build production assets
npm run build

# Check routes
php artisan route:list

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

---

**Last Updated:** November 2024
