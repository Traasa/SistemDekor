# SIMT Wedding Organizer - Inventory Management System

## Overview

Sistem manajemen inventaris untuk mengelola barang-barang perusahaan wedding organizer seperti dekorasi, furnitur, lighting, audio visual, dan catering equipment.

---

## Database Structure

### Tables

#### 1. inventory_categories

Kategori barang inventaris

```sql
- id
- name (string)
- code (string, unique) - Kode kategori (DKR, FRN, LGT, dll)
- description (text)
- color (string) - Warna untuk UI
- is_active (boolean)
- timestamps
```

#### 2. inventory_items

Barang inventaris

```sql
- id
- category_id (FK)
- name (string)
- code (string, unique) - Kode barang (DKR-001, FRN-002, dll)
- description (text)
- unit (string) - Satuan (pcs, set, box, dll)
- quantity (integer) - Stok saat ini
- minimum_stock (integer) - Minimum stok (untuk alert)
- purchase_price (decimal) - Harga beli
- selling_price (decimal) - Harga sewa per acara
- location (string) - Lokasi penyimpanan
- condition (enum: good, fair, poor)
- image_url (string)
- is_active (boolean)
- timestamps
```

#### 3. inventory_transactions

Riwayat transaksi inventaris (masuk/keluar)

```sql
- id
- inventory_item_id (FK)
- user_id (FK) - Staff yang input
- order_id (FK, nullable) - Jika terkait order
- type (enum: in, out, adjustment)
- quantity (integer)
- stock_before (integer)
- stock_after (integer)
- notes (text)
- transaction_date (date)
- timestamps
```

---

## API Endpoints

### Inventory Categories

#### Get All Categories

```
GET /api/inventory-categories
```

Response:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Dekorasi",
            "code": "DKR",
            "description": "Perlengkapan dekorasi pernikahan",
            "color": "#EC4899",
            "is_active": true,
            "active_items_count": 15
        }
    ]
}
```

#### Create Category (Admin Only)

```
POST /api/inventory-categories
```

Body:

```json
{
    "name": "Dokumentasi",
    "code": "DOC",
    "description": "Peralatan dokumentasi",
    "color": "#8B5CF6"
}
```

#### Update Category

```
PUT /api/inventory-categories/{id}
```

#### Delete Category

```
DELETE /api/inventory-categories/{id}
```

---

### Inventory Items

#### Get All Items (with filters)

```
GET /api/inventory-items?category_id=1&stock_status=low_stock&search=kursi&per_page=15
```

Query Parameters:

- `category_id`: Filter by category
- `stock_status`: `low_stock`, `out_of_stock`, `in_stock`
- `search`: Search by name or code
- `per_page`: Items per page

Response:

```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": 1,
                "category_id": 1,
                "name": "Standing Flower",
                "code": "DKR-001",
                "description": "Standing flower bunga segar mix",
                "unit": "pcs",
                "quantity": 20,
                "minimum_stock": 5,
                "purchase_price": 150000,
                "selling_price": 250000,
                "location": "Gudang A - Rak 1",
                "condition": "good",
                "stock_status": "in_stock",
                "is_low_stock": false,
                "is_out_of_stock": false,
                "category": {
                    "id": 1,
                    "name": "Dekorasi",
                    "code": "DKR"
                }
            }
        ],
        "current_page": 1,
        "per_page": 15,
        "total": 50
    }
}
```

#### Get Item Detail

```
GET /api/inventory-items/{id}
```

Includes transaction history.

#### Create Item

```
POST /api/inventory-items
```

Body:

```json
{
    "category_id": 1,
    "name": "Backdrop Premium",
    "code": "DKR-010",
    "description": "Backdrop premium 4x5 meter",
    "unit": "pcs",
    "quantity": 10,
    "minimum_stock": 2,
    "purchase_price": 800000,
    "selling_price": 1200000,
    "location": "Gudang A - Rak 5",
    "condition": "good"
}
```

#### Update Item

```
PUT /api/inventory-items/{id}
```

#### Delete Item

```
DELETE /api/inventory-items/{id}
```

#### Add Stock (Stock In)

```
POST /api/inventory-items/{id}/add-stock
```

Body:

```json
{
    "quantity": 10,
    "notes": "Pembelian baru dari supplier"
}
```

Response:

```json
{
    "success": true,
    "message": "Stock added successfully",
    "data": {
        "id": 1,
        "quantity": 30,
        "stock_status": "in_stock"
    }
}
```

#### Remove Stock (Stock Out)

```
POST /api/inventory-items/{id}/remove-stock
```

Body:

```json
{
    "quantity": 5,
    "order_id": 10,
    "notes": "Digunakan untuk acara pernikahan"
}
```

Validation: Akan gagal jika stok tidak cukup.

#### Get Low Stock Items

```
GET /api/inventory-items-low-stock
```

Returns items where quantity <= minimum_stock

---

### Inventory Transactions

#### Get Transaction History

```
GET /api/inventory-transactions?inventory_item_id=1&type=out&per_page=20
```

Query Parameters:

- `inventory_item_id`: Filter by item
- `type`: `in`, `out`, `adjustment`
- `per_page`: Items per page

Response:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "inventory_item_id": 1,
            "user_id": 1,
            "order_id": 10,
            "type": "out",
            "quantity": 5,
            "stock_before": 30,
            "stock_after": 25,
            "notes": "Digunakan untuk order #10",
            "transaction_date": "2025-11-14",
            "inventory_item": {
                "name": "Standing Flower",
                "code": "DKR-001"
            },
            "user": {
                "name": "Admin"
            }
        }
    ]
}
```

#### Get Single Transaction

```
GET /api/inventory-transactions/{id}
```

---

## Features

### 1. Stock Management

- ✅ Add stock (stock in)
- ✅ Remove stock (stock out)
- ✅ Stock adjustment
- ✅ Automatic stock calculation
- ✅ Transaction history tracking

### 2. Stock Alerts

- ✅ Low stock warning (quantity <= minimum_stock)
- ✅ Out of stock alert (quantity <= 0)
- ✅ Stock status indicator (in_stock, low_stock, out_of_stock)

### 3. Categorization

- ✅ Multiple categories
- ✅ Category-based filtering
- ✅ Color-coded categories for UI

### 4. Integration with Orders

- ✅ Link inventory usage to orders
- ✅ Automatic stock reduction when used in event
- ✅ Track which items used for which order

### 5. Audit Trail

- ✅ Complete transaction history
- ✅ Track who made changes (user_id)
- ✅ Stock before/after tracking
- ✅ Transaction notes

---

## Sample Data (Seeded)

### Categories:

1. **Dekorasi** (DKR) - #EC4899
2. **Furnitur** (FRN) - #8B5CF6
3. **Lighting** (LGT) - #F59E0B
4. **Audio Visual** (AVS) - #3B82F6
5. **Catering Equipment** (CTR) - #10B981

### Sample Items:

- Standing Flower (DKR-001) - 20 pcs
- Backdrop Kain (DKR-002) - 15 pcs
- Kursi Tiffany Putih (FRN-001) - 200 pcs
- Meja Bulat (FRN-002) - 50 pcs
- LED Par Light (LGT-001) - 30 pcs
- Moving Head Light (LGT-002) - 10 pcs
- Sound System (AVS-001) - 8 set
- Wireless Microphone (AVS-002) - 12 set
- Chafing Dish (CTR-001) - 40 pcs
- Piring Keramik (CTR-002) - 500 pcs

---

## Business Flow

### Workflow Penggunaan Inventory:

1. **Admin/Sales Create Order**
    - Input order details
    - Select items from inventory yang akan digunakan

2. **System Auto-Deduct Stock**
    - When order confirmed → auto remove stock
    - Create inventory_transaction with order_id

3. **After Event**
    - Items returned → add stock back
    - Note condition if damaged

4. **Purchase New Items**
    - Admin add new items
    - Or add stock to existing items

5. **Stock Monitoring**
    - Dashboard shows low stock alerts
    - Reports for stock movement
    - Purchase planning based on minimum stock

---

## Security & Access Control

- ✅ Admin & Sales can manage inventory
- ✅ All actions logged with user_id
- ✅ Transaction history immutable (no delete)
- ✅ Stock validation before removal
- ✅ Protected API endpoints (auth required)

---

## Frontend Integration

### React Components Needed:

1. **Inventory Dashboard**
    - Stock overview
    - Low stock alerts
    - Quick stats

2. **Category Management**
    - List categories
    - Add/Edit/Delete category

3. **Item Management**
    - List items with filters
    - Add/Edit/Delete item
    - Stock in/out form
    - Item detail with transaction history

4. **Transaction History**
    - View all transactions
    - Filter by item, type, date
    - Export reports

5. **Stock Alerts**
    - Notification for low stock
    - Out of stock warnings

---

## Reports Available

1. **Stock Level Report**
    - Current stock all items
    - Low stock items
    - Out of stock items

2. **Stock Movement Report**
    - Stock in/out by period
    - Most used items
    - Stock value

3. **Item Usage Report**
    - Items used per order
    - Usage frequency
    - Depreciation tracking

---

## Next Steps for Frontend

1. Create inventory management pages in React
2. Integrate with existing admin layout
3. Add dashboard widgets for inventory stats
4. Create stock alert notifications
5. Add inventory selection when creating orders
6. Generate inventory reports
