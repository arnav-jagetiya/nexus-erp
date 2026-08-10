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

---

## 6. Sales Challans (`/api/challans`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/challans` | ADMIN, SALES | Create a new DRAFT challan with product snapshots & auto-generated retry-safe number |
| `GET` | `/api/challans` | ADMIN, SALES, WAREHOUSE, ACCOUNTS | List challans (paginated, searchable, status filter) |
| `GET` | `/api/challans/:id` | ADMIN, SALES, WAREHOUSE, ACCOUNTS | Get challan detail with line items & snapshotted metadata |
| `PATCH` | `/api/challans/:id` | ADMIN, SALES | Update DRAFT challan items or customer (re-snapshots updated products) |
| `POST` | `/api/challans/:id/cancel` | ADMIN, SALES | Cancel DRAFT challan (`DRAFT -> CANCELLED`) |
| `POST` | `/api/challans/:id/confirm` | ADMIN, SALES | Transactional confirmation (`DRAFT -> CONFIRMED`), atomic stock deduction & `OUT` movement creation |

### Sales Challan Business Rules & Security:
1. **Challan Numbering**: Auto-generated `CHN-YYYYMMDD-NNNN`. Optimistic retry (max 3 attempts) handles rare concurrent `P2002` collisions.
2. **Product Snapshots**: Product `productName`, `sku`, and `unitPrice` are captured when the DRAFT is created/updated. Subsequent changes to product details do NOT alter historical challan items.
3. **Status Machine & Valid Transitions**:
   - `DRAFT -> CONFIRMED` (Allowed, transactional stock deduction)
   - `DRAFT -> CANCELLED` (Allowed, no stock deduction)
   - `CONFIRMED` and `CANCELLED` are terminal states. Attempting invalid status transitions returns `409 INVALID_STATUS_TRANSITION`.
4. **Transactional Confirmation (`POST /api/challans/:id/confirm`)**:
   - Executes inside a single `$transaction`.
   - For every item in the challan, executes database-level conditional SQL:
     ```sql
     UPDATE products
     SET "currentStock" = "currentStock" - $1,
         "updatedAt" = NOW()
     WHERE id = $2
       AND "currentStock" >= $1
     ```
   - If ANY product has insufficient stock (`rowsAffected === 0`), the transaction throws `409 INSUFFICIENT_STOCK`, **rolls back completely**, creates NO `StockMovement` logs, and leaves the challan as `DRAFT`.
