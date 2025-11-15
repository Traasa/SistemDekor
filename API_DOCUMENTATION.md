# SIMT Wedding Organizer - API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication using Laravel Sanctum tokens.
Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

---

## Public Endpoints (No Auth Required)

### 1. Get All Packages

**GET** `/api/packages`

Response:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Paket Silver",
            "slug": "paket-silver",
            "description": "Paket pernikahan basic...",
            "base_price": 15000000,
            "image_url": "/images/packages/silver.jpg",
            "is_active": true
        }
    ]
}
```

### 2. Get Package Detail

**GET** `/api/packages/{slug}`

Response:

```json
{
  "success": true,
  "data": {
    "package": {...},
    "otherPackages": [...]
  }
}
```

### 3. Get All Portfolios

**GET** `/api/portfolios?featured=true&category=wedding&per_page=12`

Parameters:

- `featured`: boolean (optional) - Filter featured portfolios
- `category`: string (optional) - Filter by category
- `per_page`: int (optional) - Items per page (default: 12)

Response:

```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 2,
    "per_page": 12,
    "total": 24
  },
  "categories": ["wedding", "engagement"]
}
```

### 4. Verify Order (Client Verification)

**GET** `/api/verify-order/{token}`

This endpoint allows clients to view their order status using a unique verification token.

Response:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "event_date": "2025-12-25",
      "event_address": "Grand Ballroom Hotel XYZ",
      "total_price": 35000000,
      "status": "confirmed",
      "client": {
        "name": "John Doe",
        "phone": "081234567890",
        "email": "john@example.com"
      },
      "package": {
        "name": "Paket Gold"
      },
      "order_details": [...],
      "payment_transactions": [...]
    },
    "paymentSummary": {
      "total_price": 35000000,
      "total_paid": 15000000,
      "remaining_payment": 20000000,
      "dp_status": "paid",
      "dp_amount": 15000000,
      "dp_date": "2025-11-01",
      "pelunasan_status": "unpaid",
      "pelunasan_amount": 0,
      "pelunasan_date": null
    }
  }
}
```

---

## Protected Endpoints (Auth Required)

### Authentication Endpoints

#### Login

**POST** `/api/login`

```json
{
    "email": "admin@weddingorganizer.com",
    "password": "password"
}
```

Response:

```json
{
    "success": true,
    "token": "1|abc123...",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@weddingorganizer.com",
        "role": "admin"
    }
}
```

#### Logout

**POST** `/api/logout`

#### Get Current User

**GET** `/api/me`

---

## Order Management (Sales & Admin)

### 1. Get All Orders

**GET** `/api/orders`

### 2. Create Order

**POST** `/api/orders`

Request Body:

```json
{
    "client_id": 1,
    "package_id": 2,
    "event_date": "2025-12-25",
    "event_address": "Grand Ballroom Hotel XYZ",
    "total_price": 35000000,
    "status": "pending",
    "notes": "VIP Package with custom decorations",
    "order_details": [
        {
            "item_name": "Extra Flowers",
            "item_description": "500 red roses",
            "cost": 5000000,
            "quantity": 1
        }
    ]
}
```

Response includes `verification_token` that can be shared with client:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "verification_token": "abc123...xyz789",
    "verification_url": "http://localhost:3000/verify/abc123...xyz789",
    ...
  }
}
```

### 3. Get Order Detail

**GET** `/api/orders/{id}`

### 4. Update Order

**PUT** `/api/orders/{id}`

### 5. Delete Order

**DELETE** `/api/orders/{id}`

---

## Payment Transaction Management (Sales & Admin)

### 1. Get All Payment Transactions

**GET** `/api/payment-transactions`

### 2. Create Payment Transaction

**POST** `/api/payment-transactions`

Request Body:

```json
{
    "order_id": 1,
    "amount": 15000000,
    "payment_type": "DP",
    "payment_date": "2025-11-14",
    "status": "verified",
    "proof_url": "/uploads/payment-proofs/proof123.jpg",
    "notes": "Transfer via BCA"
}
```

### 3. Update Payment Transaction

**PUT** `/api/payment-transactions/{id}`

### 4. Delete Payment Transaction

**DELETE** `/api/payment-transactions/{id}`

---

## Admin Only Endpoints

### Package Management

#### Create Package

**POST** `/api/packages`

```json
{
    "name": "Paket Diamond",
    "description": "Super luxury package",
    "base_price": 75000000,
    "image_url": "/images/packages/diamond.jpg",
    "is_active": true
}
```

#### Update Package

**PUT** `/api/packages/{id}`

#### Delete Package

**DELETE** `/api/packages/{id}`

---

### Portfolio Management

#### Create Portfolio

**POST** `/api/portfolios`

```json
{
    "title": "Wedding Andi & Sinta",
    "description": "Beach wedding theme",
    "image_url": "/images/portfolio/wedding-beach-1.jpg",
    "category": "wedding",
    "is_featured": true
}
```

#### Update Portfolio

**PUT** `/api/portfolios/{id}`

#### Delete Portfolio

**DELETE** `/api/portfolios/{id}`

---

### Client Management

#### Get All Clients

**GET** `/api/clients`

#### Create Client

**POST** `/api/clients`

```json
{
    "name": "Jane Doe",
    "phone": "081234567890",
    "email": "jane@example.com",
    "address": "Jl. Contoh No. 123, Jakarta"
}
```

#### Get Client Detail

**GET** `/api/clients/{id}`

#### Update Client

**PUT** `/api/clients/{id}`

#### Delete Client

**DELETE** `/api/clients/{id}`

---

## Important Notes

### Security

1. **Verification Token**: 64-character random string, cannot be easily guessed
2. **Token Expiration**: Consider implementing token expiration for enhanced security
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: API endpoints are rate-limited to prevent abuse

### Client Verification Flow

1. Sales creates order in system → System generates `verification_token`
2. Sales gets verification URL: `http://yourapp.com/verify/{token}`
3. Sales sends URL to client via WhatsApp
4. Client opens URL → React app calls `/api/verify-order/{token}`
5. Client sees real-time order status and payment details
6. When sales updates payment → Status automatically updated on client's page

### Status Values

- **Order Status**: `pending`, `confirmed`, `completed`, `cancelled`
- **Payment Status**: `pending`, `verified`
- **Payment Type**: `DP`, `Pelunasan`

### Error Responses

All errors return JSON:

```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field": ["validation error message"]
    }
}
```

Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error
