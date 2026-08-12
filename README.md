# NEXUS ERP

A full-stack Mini ERP and CRM Operations Portal designed for wholesale and distribution businesses to manage customers, catalog products, track inventory, and generate sales challans securely.

## Overview

Wholesale and distribution operations often struggle with disjointed systems—using one tool for customer management, another for inventory, and manual spreadsheets for sales challans. This fragmentation leads to overselling out-of-stock items, pricing errors, and lost customer histories.

NEXUS ERP solves this by providing a unified, secure portal where sales teams can manage customers and draft challans, warehouse teams can track and adjust inventory, and administrators have complete oversight. The system features a robust Role-Based Access Control (RBAC) model, ensuring data integrity and enforcing business rules (like preventing negative stock on challan confirmation) across the entire operational pipeline.

## Key Features

### Authentication & RBAC
- Secure JWT-based authentication with stateless tokens.
- Four distinct organizational roles: **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS**.
- Strict server-side route protection and frontend UI adaptation based on the user's role.

### Customer CRM
- Complete customer lifecycle management (Lead, Active, Inactive).
- Track mobile, email, GST number, customer type (Retail, Wholesale, Distributor), and addresses.
- Integrated follow-up logging system to record interaction histories and next-action dates.

### Products & Inventory
- Centralized product catalog with SKU, category, and pricing.
- Real-time stock level tracking with minimum stock alerts.
- Dedicated Stock Movements ledger recording every `IN` and `OUT` adjustment with reasons, timestamps, and the user who authorized the change.

### Sales Challans
- Draft, Confirm, and Cancel workflows for sales challans.
- Automatic generation of sequential challan numbers.
- Atomic stock deduction: Confirming a challan automatically verifies stock availability, rejects the operation if insufficient, deducts the stock, and logs the movement.
- Immutable snapshotting: Challan items store the product name, SKU, and unit price at the time of the transaction, ensuring historical accuracy even if the core product is later modified.

### Dashboard
- High-level overview of system metrics (dependent on user role), providing quick access to critical business health indicators.

### Other Implemented Features
- Responsive "Industrial Spatial" UI with dynamic theme switching (Dark/Light/System).
- Global search and filtering capabilities across CRM, Products, and Challans.
- Automated API error handling and unified standard response formatting.

## Tech Stack

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **React Router v6**
- **TanStack Query v5**
- **React Hook Form & Zod** (Validation)
- **Lucide React** (Icons)

### Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **Zod** (Request Validation)

### Database
- **PostgreSQL**

### Authentication
- **JSON Web Tokens (JWT)**
- **Bcrypt.js** (Password Hashing)

### ORM / Tooling
- **Prisma ORM** (Schema, Migrations, Client)

### Deployment
- **Frontend Hosting**: Render Static Site
- **Backend Hosting**: Render Web Service
- **Database Hosting**: Supabase PostgreSQL

## Architecture

NEXUS ERP follows a modern, decoupled client-server architecture:

`Browser UI` → `React/Vite Frontend` → `REST API` → `Express/Node Backend` → `Prisma ORM` → `PostgreSQL`

### Frontend Structure (`/client`)
Built as a Single Page Application (SPA). Uses `React Router` for navigation and protected routes. Data fetching and caching are managed by `TanStack Query`. The UI is built using custom components styled with `Tailwind CSS`.

### Backend Structure (`/server`)
Follows a modular, feature-based directory structure (`/src/modules/`). Each module contains its own:
- **Routes**: Express router definitions.
- **Controller**: HTTP request/response handling.
- **Service**: Core business logic and database interactions.
- **Schema**: Zod validation schemas for incoming payloads.

### Middleware Layer
- **Authentication**: Verifies JWTs from the `Authorization` header and injects the user into the request context.
- **RBAC**: Checks if the authenticated user's role is permitted to access the endpoint.
- **Validation**: Intercepts requests and validates bodies/queries against Zod schemas before hitting controllers.
- **Error Handling**: A global error handler catches `ApiError` instances and normalizes error responses.

## Database Design

The database is managed via Prisma and PostgreSQL. Key entities include:

- **User**: System users with role, authentication, and status data. One-to-many with StockMovements and Challans (as the creator).
- **Customer**: CRM profiles. One-to-many with CustomerFollowUp and Challans.
- **CustomerFollowUp**: Historical notes linked to a Customer.
- **Product**: Catalog items with current stock and minimum stock alerts. One-to-many with StockMovements and ChallanItems.
- **StockMovement**: An immutable ledger of inventory changes (`IN` or `OUT`), linked to a Product and the User who authorized it.
- **Challan**: Sales documents tracking status (`DRAFT`, `CONFIRMED`, `CANCELLED`). Linked to a Customer and a User.
- **ChallanItem**: Line items for a Challan. Crucially, these fields (`productName`, `sku`, `unitPrice`) act as a **snapshot** of the product at the time of creation, ensuring historical data integrity even if the source product changes.

## Sales Challan Business Flow

The core business logic of the application revolves around the Sales Challan lifecycle:

1. **Creation**: User (Sales/Admin) selects a customer and adds products/quantities to a new Challan.
2. **Draft State**: The backend validates the payload and creates a Challan with status `DRAFT`. No stock is affected yet.
3. **Confirmation**: The user requests to confirm the Challan.
4. **Validation**: The backend iterates through all Challan items, checking if `product.currentStock >= item.quantity`.
5. **Rejection**: If any product has insufficient stock, the entire confirmation transaction is aborted, and a 400 Bad Request error is returned.
6. **Execution (Transaction)**: If stock is sufficient, a Prisma database transaction atomically:
   - Updates the Challan status to `CONFIRMED`.
   - Decrements the `currentStock` for each Product.
   - Creates a `StockMovement` (OUT) record for each product, documenting the Challan deduction.
7. **Result**: The updated Challan is returned to the client.

## API Documentation

All endpoints are prefixed with `/api`. Standard responses follow: `{ success: boolean, message: string, data: any }`.

### Authentication
- `POST /auth/login` - Authenticate user and receive JWT.
- `GET /auth/me` - (Auth Required) Get current authenticated user profile.

### Customers
- `POST /customers` - (Admin/Sales) Create a new customer.
- `GET /customers` - (Auth Required) List customers (supports search, pagination).
- `GET /customers/:id` - (Auth Required) Get customer details and follow-ups.
- `PUT /customers/:id` - (Admin/Sales) Update a customer.
- `POST /customers/:id/follow-ups` - (Admin/Sales) Add a follow-up note.

### Products
- `POST /products` - (Admin/Warehouse) Create a product.
- `GET /products` - (Auth Required) List products (supports search, category, lowStock filters).
- `GET /products/:id` - (Auth Required) Get product details.
- `PATCH /products/:id` - (Admin/Warehouse) Update product details.

### Inventory
- `POST /inventory/adjust` - (Admin/Warehouse) Manually adjust stock (`IN`/`OUT`) with a reason.
- `GET /inventory/movements` - (Auth Required) Get the immutable stock movement ledger.

### Challans
- `POST /challans` - (Admin/Sales) Create a draft challan.
- `GET /challans` - (Auth Required) List challans (supports search, status filters).
- `GET /challans/:id` - (Auth Required) Get challan details and items.
- `PUT /challans/:id` - (Admin/Sales) Update a draft challan.
- `POST /challans/:id/confirm` - (Admin/Sales) Confirm challan and deduct stock.
- `POST /challans/:id/cancel` - (Admin/Sales) Cancel a draft challan.

## Authentication

Authentication is handled statelessly using JSON Web Tokens (JWT).
- Upon successful `/auth/login`, the server generates a JWT containing the user's ID and Role.
- The client stores this token (in memory/localStorage) and attaches it as a Bearer token in the `Authorization` header for subsequent requests.
- Passwords are securely hashed using `Bcrypt.js` before storage.
- Backend middleware (`requireAuth`) verifies the token signature and expiration.
- Backend middleware (`requireRole`) intercepts requests based on the extracted role before they reach the controller.

## Local Development Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL 17 (or compatible) running locally on port 5432

### 2. Backend Setup
```bash
cd server
npm install
cp ../.env.example .env
```
Ensure your local PostgreSQL is running and create a database named `nexus_erp`. Update the `DATABASE_URL` in `server/.env`.
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
Backend runs on `http://localhost:4000`.

### 3. Frontend Setup
```bash
cd client
npm install
cp ../.env.example .env
```
Ensure `VITE_API_URL` is pointing to `http://localhost:4000/api`.
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Environment Variables

### Backend (`server/.env`)
- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

### Frontend (`client/.env`)
- `VITE_API_URL`

*Note: Never commit actual `.env` files containing real secrets to version control.*

## Production Deployment

### Backend (Render Web Service)
1. Environment: Node.js
2. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
3. Start Command: `npm start`
4. Required Env Vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (pointing to production frontend URL), `PORT`, `NODE_ENV=production`.

### Frontend (Render Static Site)
1. Environment: Static Site
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Required Env Vars: `VITE_API_URL` (pointing to production backend URL).
5. Ensure SPA Routing is configured (Rewrite all requests to `/index.html` so direct navigation and browser refreshes on frontend application routes work correctly).

### Database (Supabase PostgreSQL)
- Hosted PostgreSQL instance on Supabase.

## Test Credentials

The following credentials are created when running `npm run prisma:seed`. Use them to evaluate the different RBAC views:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@nexus.com` | `Admin@123` | Full system access |
| **SALES** | `sales@nexus.com` | `Sales@123` | Customer CRM & Sales Challans |
| **WAREHOUSE** | `warehouse@nexus.com` | `Warehouse@123` | Products & Inventory Management |
| **ACCOUNTS** | `accounts@nexus.com` | `Accounts@123` | Read-only financial audit access |

## GitHub
[https://github.com/arnav-jagetiya/nexus-erp](https://github.com/arnav-jagetiya/nexus-erp)

## Documentation
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Postman Collection](postman/NEXUS-ERP.postman_collection.json)

## Live Demo
- **Frontend UI:** [https://nexus-erp-1szs.onrender.com](https://nexus-erp-1szs.onrender.com)
- **Backend API:** [https://nexus-erp-api-rars.onrender.com](https://nexus-erp-api-rars.onrender.com)
- **Backend Health Check:** [https://nexus-erp-api-rars.onrender.com/api/health](https://nexus-erp-api-rars.onrender.com/api/health)

*Note: The backend does not expose a root `/` endpoint. Use `/api/health` to verify API availability.*

## Assumptions
- GST format validation assumes standard Indian GSTIN formats, but is kept relatively lenient for testing.
- Challan items store a snapshot of the product price at the time of creation. Editing a draft challan uses the originally snapshotted price unless re-added.
- Stock movements are immutable ledgers. Once created, they cannot be modified, only offset by a new movement.

## Known Limitations
- The system currently assumes a single warehouse location. Multi-warehouse stock tracking is not fully implemented in the schema.
- PDF generation/Printing of Challans relies on the browser's native `window.print()` functionality rather than a dedicated server-side PDF generator.
- Password reset functionality via email is not currently implemented.

## Future Improvements
- Server-side PDF generation for Sales Challans.
- Integration with external email services (e.g., SendGrid) for customer follow-up reminders.
- Multi-warehouse inventory tracking and transfer workflows.

## Project Structure
```text
nexus-erp/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios clients & interceptors
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based modules (Products, Challans, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   └── styles/          # Tailwind CSS
├── server/                  # Node.js Backend (Express)
│   ├── prisma/              # Schema & Migrations
│   ├── src/
│   │   ├── config/          # Environment & Database config
│   │   ├── middleware/      # Auth, RBAC & Error Handling
│   │   ├── modules/         # Feature-based modules (Controllers, Services)
│   │   └── utils/           # Utilities
└── README.md                # This document
```

## Submission Checklist
- [x] GitHub repository with complete source code.
- [x] Live frontend deployment URL.
- [x] Live backend deployment URL.
- [x] Test credentials documented.
- [x] API documentation included.
- [x] README properly formatted.
- [x] Architecture and business flow explained.
- [x] Known limitations disclosed.
