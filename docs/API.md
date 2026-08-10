# NEXUS ERP — API Documentation

## Base URL
`http://localhost:4000/api`

---

## 1. System Health

### `GET /api/health`
Check API server status.

---

## 2. Authentication

### `POST /api/auth/login`
Authenticate user credentials and receive a 24-hour HS256 JWT token.

### `GET /api/auth/me`
Retrieve profile of currently authenticated user.

---

## 3. Customer CRM (`/api/customers`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/customers` | ADMIN, SALES | Create a new customer |
| `GET` | `/api/customers` | ADMIN, SALES, ACCOUNTS | List customers (paginated, searchable, filterable) |
| `GET` | `/api/customers/:id` | ADMIN, SALES, ACCOUNTS | Get customer details with follow-ups |
| `PATCH` | `/api/customers/:id` | ADMIN, SALES | Update customer information |
| `DELETE` | `/api/customers/:id` | ADMIN | Delete customer (blocked if challans exist) |
| `POST` | `/api/customers/:id/followups` | ADMIN, SALES | Add a follow-up note (createdBy auto-assigned) |
| `GET` | `/api/customers/:id/followups` | ADMIN, SALES, ACCOUNTS | List customer follow-up notes |

---

## 4. Products Catalog (`/api/products`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/products` | ADMIN, WAREHOUSE | Create a new product (unique SKU) |
| `GET` | `/api/products` | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List products (paginated, searchable, filterable) |
| `GET` | `/api/products/:id` | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get product details & stock info |
| `PATCH` | `/api/products/:id` | ADMIN, WAREHOUSE | Update product metadata (**currentStock cannot be edited directly**) |
| `DELETE` | `/api/products/:id` | ADMIN, WAREHOUSE | Delete product (blocked if stock movements/challans exist) |

---

## 5. Inventory & Stock Movements (`/api/inventory`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/inventory` | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Stock overview with derived status (`HEALTHY`, `LOW`, `CRITICAL`) |
| `GET` | `/api/inventory/movements` | ADMIN, WAREHOUSE, ACCOUNTS | List stock movement history log |
| `POST` | `/api/inventory/movements` | ADMIN, WAREHOUSE | Record manual stock movement (`IN` or `OUT`) |

### Concurrent & Stock Safety Rules for `POST /api/inventory/movements`:
- `createdBy` is automatically assigned from `req.user.id`.
- **IN Movements**: Atomically increments product stock and logs `IN` movement.
- **OUT Movements**: Uses conditional atomic SQL UPDATE (`WHERE currentStock >= quantity`). If stock is insufficient, 0 rows are updated, transaction rolls back, returns `409 INSUFFICIENT_STOCK`, and NO movement record is created.
