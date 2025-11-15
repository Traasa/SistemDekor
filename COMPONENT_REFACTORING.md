# Component Refactoring Documentation

## Overview

Halaman User Management dan Order Management telah dipecah menjadi komponen-komponen yang lebih kecil dan reusable untuk meningkatkan maintainability dan mengurangi kompleksitas kode.

## User Management Components

### 1. UserStats Component (`UserStats.tsx`)

**Props:**

- `users: User[]` - Array of users untuk menghitung statistik

**Fungsi:**

- Menampilkan 3 kartu statistik: Total Users, Active Users, Admin & Sales
- Menggunakan gradient background (pink, gold, purple)
- Icons SVG untuk visual representation

**Usage:**

```tsx
<UserStats users={users} />
```

### 2. UserFilters Component (`UserFilters.tsx`)

**Props:**

- `searchTerm: string`
- `setSearchTerm: (value: string) => void`
- `filterRole: string`
- `setFilterRole: (value: string) => void`
- `onSearch: () => void`
- `onAddNew: () => void`

**Fungsi:**

- Search input dengan icon (Enter key support)
- Dropdown filter role (all, admin, sales, user)
- Tombol Search
- Tombol "Tambah User" dengan icon

**Usage:**

```tsx
<UserFilters
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    filterRole={filterRole}
    setFilterRole={setFilterRole}
    onSearch={handleSearch}
    onAddNew={() => handleOpenModal()}
/>
```

### 3. UserTable Component (`UserTable.tsx`)

**Props:**

- `users: User[]`
- `isLoading: boolean`
- `onEdit: (user: User) => void`
- `onDelete: (userId: number) => void`

**Fungsi:**

- Loading state dengan spinner
- Empty state dengan icon dan pesan
- Tabel user dengan kolom: User (avatar + nama/email), Role (badge), Status (verified/unverified), Created, Actions
- Tombol Edit dan Delete per row
- Badge colors berdasarkan role dan status

**Usage:**

```tsx
<UserTable users={users} isLoading={isLoading} onEdit={handleOpenModal} onDelete={handleDelete} />
```

### 4. UserModal Component (`UserModal.tsx`)

**Props:**

- `isOpen: boolean`
- `onClose: () => void`
- `editingUser: User | null`
- `formData: CreateUserData`
- `setFormData: (data: CreateUserData) => void`
- `formErrors: Record<string, string>`
- `onSubmit: (e: React.FormEvent) => void`

**Fungsi:**

- Modal overlay untuk Create/Edit user
- Form fields: Nama, Email, Password, Confirm Password, Role
- Validation error display
- Close button (X)
- Tombol Batal & Simpan/Update

**Usage:**

```tsx
<UserModal
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    editingUser={editingUser}
    formData={formData}
    setFormData={setFormData}
    formErrors={formErrors}
    onSubmit={handleSubmit}
/>
```

## Order Management Components

### 1. OrderStats Component (`OrderStats.tsx`)

**Props:**

- `orders: Order[]`

**Fungsi:**

- Menampilkan 4 kartu statistik: Total Orders, Pending, Completed, Total Revenue
- Gradient backgrounds (blue, yellow, green, pink)
- Icons SVG
- Currency formatting untuk revenue (IDR)

**Usage:**

```tsx
<OrderStats orders={orders} />
```

### 2. OrderFilters Component (`OrderFilters.tsx`)

**Props:**

- `searchTerm: string`
- `setSearchTerm: (value: string) => void`
- `filterStatus: string`
- `setFilterStatus: (value: string) => void`
- `onSearch: () => void`

**Fungsi:**

- Search input (cari client atau lokasi event)
- Dropdown filter status (all, pending, confirmed, processing, completed, cancelled)
- Tombol Cari
- Enter key support

**Usage:**

```tsx
<OrderFilters
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    filterStatus={filterStatus}
    setFilterStatus={setFilterStatus}
    onSearch={handleSearch}
/>
```

### 3. OrderTable Component (`OrderTable.tsx`)

**Props:**

- `orders: Order[]`
- `isLoading: boolean`
- `onStatusChange: (orderId: number, newStatus: string) => void`
- `onDelete: (orderId: number) => void`

**Fungsi:**

- Loading state dengan spinner
- Empty state dengan icon
- Tabel order dengan kolom: Order ID, Client (nama + email), Package (nama + guest count), Event Date (tanggal + lokasi), Total Price (IDR format), Status (dropdown select), Actions (Hapus)
- Inline status editing dengan dropdown
- Status badge colors
- Currency formatting

**Usage:**

```tsx
<OrderTable orders={orders} isLoading={isLoading} onStatusChange={handleStatusChange} onDelete={handleDelete} />
```

## Refactored Pages

### UsersPage (`pages/admin/UsersPage.tsx`)

**Before:** 385 lines (monolithic)
**After:** ~180 lines (modular)

**Structure:**

```
UsersPage
├── Header (title + description)
├── UserStats (component)
├── UserFilters (component)
├── UserTable (component)
└── UserModal (component)
```

**State Management:**

- users, searchTerm, filterRole, isLoading
- isModalOpen, editingUser, formData, formErrors

**Functions:**

- fetchUsers() - API call with filters
- handleSearch() - trigger fetch
- handleOpenModal(user?) - open create/edit modal
- handleCloseModal() - close and reset modal
- handleSubmit(e) - create or update user
- handleDelete(id) - delete user

### OrdersPage (`pages/admin/OrdersPage.tsx`)

**Before:** 290 lines (monolithic)
**After:** ~110 lines (modular)

**Structure:**

```
OrdersPage
├── Header (title + "Buat Order Baru" button)
├── OrderStats (component)
├── OrderFilters (component)
├── OrderTable (component)
└── Pagination (if totalPages > 1)
```

**State Management:**

- orders, searchTerm, filterStatus, isLoading
- currentPage, totalPages

**Functions:**

- fetchOrders() - API call with filters & pagination
- handleSearch() - reset page and fetch
- handleStatusChange(id, status) - update order status
- handleDelete(id) - delete order

## Benefits of Refactoring

### 1. **Maintainability**

- Setiap komponen memiliki tanggung jawab tunggal (Single Responsibility Principle)
- Mudah menemukan dan memperbaiki bug
- Perubahan pada satu komponen tidak mempengaruhi komponen lain

### 2. **Reusability**

- Komponen dapat digunakan kembali di halaman lain
- UserTable dapat digunakan untuk menampilkan user di berbagai context
- Stats components dapat digunakan di dashboard

### 3. **Testability**

- Komponen kecil lebih mudah di-unit test
- Props interface yang jelas memudahkan testing

### 4. **Code Readability**

- File lebih pendek dan fokus
- Logic bisnis terpisah dari presentasi
- Easier onboarding untuk developer baru

### 5. **Performance**

- Komponen dapat di-optimize secara individual
- Easier untuk implement React.memo() jika diperlukan

## File Structure

```
resources/js/
├── components/
│   └── admin/
│       ├── index.ts (barrel export)
│       ├── UserStats.tsx
│       ├── UserFilters.tsx
│       ├── UserTable.tsx
│       ├── UserModal.tsx
│       ├── OrderStats.tsx
│       ├── OrderFilters.tsx
│       └── OrderTable.tsx
└── pages/
    └── admin/
        ├── UsersPage.tsx (refactored)
        └── OrdersPage.tsx (refactored)
```

## Future Improvements

### Short Term:

1. Add TypeScript prop validation with strict types
2. Implement error boundaries for components
3. Add loading skeleton untuk better UX
4. Implement debounce untuk search input

### Medium Term:

1. Create OrderModal untuk Create/Edit Order
2. Implement React.memo() untuk prevent unnecessary re-renders
3. Add unit tests dengan Jest + React Testing Library
4. Create Storybook stories untuk setiap component

### Long Term:

1. Migrate to headless UI libraries (Radix, Headless UI)
2. Implement virtual scrolling untuk large datasets
3. Add advanced filtering (date range, multiple filters)
4. Create generic Table component yang reusable

## Color Scheme Reference

### User Management:

- **Total Users**: Pink gradient (`from-pink-500 to-pink-600`)
- **Active Users**: Gold gradient (`from-gold-500 to-gold-600`)
- **Admin & Sales**: Purple gradient (`from-purple-500 to-purple-600`)

### Order Management:

- **Total Orders**: Blue gradient (`from-blue-500 to-blue-600`)
- **Pending**: Yellow gradient (`from-yellow-500 to-yellow-600`)
- **Completed**: Green gradient (`from-green-500 to-green-600`)
- **Total Revenue**: Pink gradient (`from-pink-500 to-pink-600`)

### Status Badges:

- **pending**: `bg-yellow-100 text-yellow-800`
- **confirmed**: `bg-blue-100 text-blue-800`
- **processing**: `bg-purple-100 text-purple-800`
- **completed**: `bg-green-100 text-green-800`
- **cancelled**: `bg-red-100 text-red-800`

### Role Badges:

- **admin**: `bg-red-100 text-red-800`
- **sales**: `bg-blue-100 text-blue-800`
- **user**: `bg-gray-100 text-gray-800`

## Notes

- Semua komponen menggunakan Tailwind CSS untuk styling
- Icons menggunakan SVG inline (no icon library dependency)
- Currency format: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- Date format: `toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })`
- Forms menggunakan controlled components
- Modal menggunakan fixed overlay dengan z-50
- Responsive design dengan Tailwind breakpoints (md:, sm:)
