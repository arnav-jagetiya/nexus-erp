# NEXUS ERP REST API Documentation

## Table of Contents
- [API Lifecycle Overview](#api-lifecycle-overview)
- [Health](#health)
- [Authentication](#authentication)
- [Customers](#customers)
- [Products](#products)
- [Inventory](#inventory)
- [Challans](#challans)

---

## API Lifecycle Overview

All API requests follow a standardized lifecycle in the backend:

`Frontend` → `Axios` → `REST Endpoint (/api/*)` → `Express Router` → `Middleware (Auth & RBAC)` → `Zod Validation` → `Controller` → `Service` → `Prisma` → `PostgreSQL` → `Response` → `Frontend`

- All authenticated routes require a valid JWT passed in the `Authorization` header as `Bearer <JWT_TOKEN>`.
- The backend root `/` does **not** expose an API endpoint. Use `/api/health` to verify backend availability.

---

## Health

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | None | None | Verify API availability and environment status. |

---

## Authentication

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | None | None | Authenticate user and receive JWT. |
| **POST** | `/api/auth/register` | None | None | Register a new user (approval pending). |
| **GET** | `/api/auth/me` | Required | Any | Retrieve the current authenticated user's profile. |
| **POST** | `/api/auth/forgot-password` | None | None | Mock endpoint for password recovery. |
| **POST** | `/api/auth/reset-password` | None | None | Mock endpoint for password reset. |

**Example: `POST /api/auth/login`**
```json
// Request Body
{
  "email": "admin@nexus.com",
  "password": "your_password"
}

// Success Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "admin@nexus.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "token": "<JWT_TOKEN>"
  }
}
```

---

## Customers

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/customers` | Required | ADMIN, SALES, ACCOUNTS | List and search customers. |
| **POST** | `/api/customers` | Required | ADMIN, SALES | Create a new customer profile. |
| **GET** | `/api/customers/:id` | Required | ADMIN, SALES, ACCOUNTS | Get specific customer details (includes follow-ups). |
| **PATCH**| `/api/customers/:id` | Required | ADMIN, SALES | Update customer profile. |
| **DELETE**| `/api/customers/:id` | Required | ADMIN | Delete a customer. |
| **GET** | `/api/customers/:id/followups` | Required | ADMIN, SALES, ACCOUNTS | List follow-up history for a customer. |
| **POST** | `/api/customers/:id/followups` | Required | ADMIN, SALES | Add a follow-up note to a customer. |

**Example: `POST /api/customers`**
```json
// Request Body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "1234567890",
  "businessName": "Doe Enterprises",
  "customerType": "RETAIL",
  "address": "123 Main St",
  "status": "LEAD"
}
```

---

## Products

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Required | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List and search products. |
| **POST** | `/api/products` | Required | ADMIN, WAREHOUSE | Create a new product. |
| **GET** | `/api/products/:id` | Required | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get specific product details. |
| **PATCH**| `/api/products/:id` | Required | ADMIN, WAREHOUSE | Update product information. |
| **DELETE**| `/api/products/:id` | Required | ADMIN, WAREHOUSE | Delete a product. |

**Example: `POST /api/products`**
```json
// Request Body
{
  "name": "Steel Pipe",
  "sku": "STL-001",
  "category": "Hardware",
  "unitPrice": 1450.00,
  "minStockAlert": 30,
  "location": "Warehouse Bay A"
}
```

---

## Inventory

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/inventory` | Required | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get high-level inventory overview metrics. |
| **GET** | `/api/inventory/movements` | Required | ADMIN, WAREHOUSE, ACCOUNTS | List immutable stock movement ledger. |
| **POST** | `/api/inventory/movements` | Required | ADMIN, WAREHOUSE | Manually adjust stock (`IN` or `OUT`). |

**Example: `POST /api/inventory/movements`**
```json
// Request Body
{
  "productId": "<product_id>",
  "quantity": 50,
  "movementType": "IN",
  "reason": "New supplier delivery"
}
```

---

## Challans

| Method | Endpoint | Authentication | Required Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/challans` | Required | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List sales challans. |
| **POST** | `/api/challans` | Required | ADMIN, SALES | Create a new sales challan (DRAFT status). |
| **GET** | `/api/challans/:id` | Required | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get challan details and its line items. |
| **PATCH**| `/api/challans/:id` | Required | ADMIN, SALES | Update a DRAFT challan. |
| **POST** | `/api/challans/:id/confirm`| Required | ADMIN, SALES | Confirm challan (deducts stock and records movements). |
| **POST** | `/api/challans/:id/cancel` | Required | ADMIN, SALES | Cancel a challan. |

**Example: `POST /api/challans`**
```json
// Request Body
{
  "customerId": "<customer_id>",
  "items": [
    {
      "productId": "<product_id>",
      "quantity": 10
    }
  ]
}
```
