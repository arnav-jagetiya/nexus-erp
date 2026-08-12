# NEXUS ERP Technical Architecture

## Table of Contents
1. [Architecture Overview](#section-1--architecture-overview)
2. [Frontend Architecture](#section-2--frontend-architecture)
3. [Backend Architecture](#section-3--backend-architecture)
4. [Authentication Flow](#section-4--authentication-flow)
5. [RBAC & Authorization](#section-5--rbac--authorization)
6. [Request / Response Flow](#section-6--request--response-flow)
7. [Database Architecture](#section-7--database-architecture)
8. [Inventory Architecture & Working](#section-8--inventory-architecture--working)
9. [Sales Challan Architecture](#section-9--sales-challan-architecture)
10. [Product Management Flow](#section-10--product-management-flow)
11. [Customer & CRM Flow](#section-11--customer--crm-flow)
12. [Security Architecture](#section-12--security-architecture)
13. [Deployment Architecture](#section-13--deployment-architecture)
14. [Data Integrity](#section-14--data-integrity)
15. [Important Design Decisions](#section-15--important-design-decisions)
16. [Known Limitations](#section-16--known-limitations)
17. [Future Improvements](#section-17--future-improvements)

---

## Section 1 — Architecture Overview

NEXUS ERP employs a decoupled Client-Server architecture utilizing a modern stack: React on the frontend and Express.js on the backend, communicating exclusively via REST APIs.

```mermaid
flowchart LR
    U[User / Browser]
    F[React Frontend]
    A[Axios API Layer]
    B[Express REST API]
    M[Auth & RBAC Middleware]
    V[Zod Validation]
    C[Controllers]
    S[Services / Business Logic]
    P[Prisma ORM]
    DB[(PostgreSQL)]

    U --> F
    F --> A
    A -->|HTTPS| B
    B --> M
    M --> V
    V --> C
    C --> S
    S --> P
    P --> DB
```

Data flows unidirectionally through specialized layers, ensuring that requests are fully authenticated, authorized, and validated before touching any business logic or the database.

---

## Section 2 — Frontend Architecture

The frontend is built as a robust Single Page Application (SPA).

- **Core**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **State & Data Fetching**: TanStack Query v5 (React Query) handles API caching, invalidation, and async state.
- **Forms & Validation**: React Hook Form paired with Zod.
- **Styling**: Tailwind CSS v4.

**Request Flow**:
```mermaid
flowchart TD
    UserAction[User Clicks / Submits] --> Form[React Hook Form / UI]
    Form --> Valid[Zod Client Validation]
    Valid --> Query[TanStack Query Mutation/Query]
    Query --> Axios[Axios Interceptor]
    Axios --> AuthHeader[Attach Bearer Token]
    AuthHeader --> API[Network Request to Backend]
```
The application dynamically adjusts the UI based on the user's role (extracted from the JWT or `/auth/me`). `Axios` interceptors automatically inject the JWT token (stored in localStorage) into the `Authorization: Bearer <token>` header of every outbound API request.

---

## Section 3 — Backend Architecture

The backend is built using Node.js and Express.js, utilizing a modular, domain-driven structure (`/src/modules/`).

- **Core**: Node.js, Express, TypeScript
- **Validation**: Zod
- **Database**: Prisma ORM, PostgreSQL

**Module Structure**:
Each domain (Auth, Customers, Products, Inventory, Challans) encapsulates its own:
- `*.routes.ts` (Express router)
- `*.controller.ts` (HTTP request/response handling)
- `*.service.ts` (Business logic, Prisma interactions)
- `*.schema.ts` (Zod schemas for payload validation)

**Request Lifecycle Diagram**:
```mermaid
flowchart TD
    Req[Incoming HTTP Request] --> Global[Global Middleware CORS/JSON]
    Global --> Auth[Auth Middleware]
    Auth --> RBAC[RBAC Middleware]
    RBAC --> Validate[Zod Validation Middleware]
    Validate --> Controller[Controller]
    Controller --> Service[Service Logic]
    Service --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL)]
    DB --> Prisma
    Prisma --> Service
    Service --> Controller
    Controller --> Res[ApiResponse Wrapper]
```

---

## Section 4 — Authentication Flow

Authentication is statelessly implemented using JSON Web Tokens (JWT).

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant Prisma

    User->>Frontend: Enters Email & Password
    Frontend->>AuthController: POST /api/auth/login
    AuthController->>AuthService: Extract credentials
    AuthService->>Prisma: Lookup User by Email
    Prisma-->>AuthService: Return User hash
    AuthService->>AuthService: bcrypt.compare()
    AuthService->>AuthService: Generate JWT (id, role)
    AuthService-->>AuthController: Return User data + Token
    AuthController-->>Frontend: 200 OK { token, user }
    Frontend->>Frontend: Save token in localStorage
    Frontend-->>User: Redirect to Dashboard
```

No session state is maintained on the server. The JWT expiration acts as the session boundary.

---

## Section 5 — RBAC / Authorization

NEXUS ERP defines four hierarchical/functional roles in `schema.prisma`:
- `ADMIN`: Full system access.
- `SALES`: CRM and Sales Challan creation/management.
- `WAREHOUSE`: Product catalog and Inventory/Stock management.
- `ACCOUNTS`: Read-only overview access.

```mermaid
flowchart TD
    Request[API Request] --> AuthCheck{Has Valid JWT?}
    AuthCheck -- Yes --> RoleCheck{Role in Allowed List?}
    AuthCheck -- No --> 401[401 Unauthorized]
    RoleCheck -- Yes --> Proceed[Proceed to Route]
    RoleCheck -- No --> 403[403 Forbidden]
```
While the frontend conditionally renders links (e.g., hiding "Inventory" from Sales), the **server-side RBAC middleware** is the absolute security boundary. If a user tries to forge a request to an unauthorized route, the server blocks it with a `403 Forbidden`.

---

## Section 6 — Request / Response Flow

Below represents a standard authenticated request (e.g., `POST /api/products`):

```mermaid
sequenceDiagram
    participant FE as Frontend (Axios)
    participant Router as Express Router
    participant Auth as Auth Middleware
    participant RBAC as RBAC Middleware
    participant Val as Validation Middleware
    participant Ctrl as Controller
    participant Svc as Service
    participant DB as Prisma/PostgreSQL

    FE->>Router: POST /api/products (Bearer Token)
    Router->>Auth: Verify JWT
    Auth->>RBAC: Validate Role (ADMIN, WAREHOUSE)
    RBAC->>Val: Check req.body against Zod Schema
    Val->>Ctrl: Payload Validated
    Ctrl->>Svc: Execute Business Logic
    Svc->>DB: prisma.product.create()
    DB-->>Svc: Product Record
    Svc-->>Ctrl: Returns Object
    Ctrl-->>FE: 201 Created (ApiResponse.success)
```
Any error thrown inside the Service or Controller is caught by a `try-catch` and forwarded to a global error handler using `next(error)`, returning a unified `{ success: false, error: ... }` JSON structure.

---

## Section 7 — Database Architecture

The core data models are strictly defined in `server/prisma/schema.prisma`.

```mermaid
erDiagram
    users ||--o{ stock_movements : "authorizes"
    users ||--o{ challans : "creates"
    customers ||--o{ customer_followups : "has"
    customers ||--o{ challans : "receives"
    products ||--o{ stock_movements : "tracks"
    products ||--o{ challan_items : "included_in"
    challans ||--|{ challan_items : "contains"
```

- **User**: Operators of the system.
- **Customer**: CRM profiles with status (LEAD, ACTIVE, INACTIVE).
- **CustomerFollowUp**: Historical interaction logs.
- **Product**: Catalog items. Tracks `currentStock` and `minStockAlert`.
- **StockMovement**: Immutable ledger of inventory (`IN` or `OUT`).
- **Challan**: Document representing a sale/dispatch (`DRAFT`, `CONFIRMED`, `CANCELLED`).
- **ChallanItem**: Crucially includes **snapshot fields** (`productName`, `sku`, `unitPrice`). If a product's base price is changed later, the historical challan remains accurate.

---

## Section 8 — Inventory Architecture & Working

Inventory is managed through two parallel systems: a real-time current stock integer (`currentStock`), and an immutable ledger (`StockMovement`).

**Core Behaviors**:
1. Stock can be adjusted manually (`/api/inventory/adjust` via WAREHOUSE/ADMIN) or automatically via Challans (via SALES/ADMIN).
2. Every change generates a `StockMovement` row with type `IN` or `OUT`.
3. Negative stock is strictly prevented on the backend.
4. "Low Stock" is logically calculated as `0 < currentStock < minStockAlert`. "Out of Stock" is `currentStock === 0`.

```mermaid
flowchart TD
    Adjust[Stock Adjustment Request] --> ValidQty{Quantity > 0?}
    ValidQty -- No --> Error[400 Bad Request]
    ValidQty -- Yes --> OpType{Movement Type?}
    OpType -- IN --> Add[currentStock + qty]
    OpType -- OUT --> Check{currentStock >= qty?}
    Check -- No --> Reject[400 Insufficient Stock]
    Check -- Yes --> Sub[currentStock - qty]
    Add --> Trans[Prisma Transaction]
    Sub --> Trans
    Trans --> UpdProd[Update Product]
    Trans --> WriteLog[Create StockMovement Record]
```

---

## Section 9 — Sales Challan Architecture

The Sales Challan is the most complex business flow, heavily intertwined with inventory.

1. **Draft**: A challan is created as a `DRAFT`. No stock is affected.
2. **Confirm**: The user confirms the challan.
3. **Execution**: The backend utilizes a Prisma `$transaction` to ensure atomicity.

**Sales Challan Flow**:
```mermaid
flowchart TD
    Create[Create Challan] --> Draft[Draft State]
    Draft --> Edit[Edit Challan Items]
    Edit --> Draft
    Draft --> ConfirmAct[Confirm Action]
    ConfirmAct --> CheckStock{Check Inventory Stock}
    CheckStock -- Insufficient --> Reject[Reject Confirmation / Error]
    Reject --> Draft
    CheckStock -- Sufficient --> Trans[Prisma Transaction]
    Trans --> Deduct[Deduct Product Stock]
    Deduct --> CreateLog[Create OUT StockMovement]
    CreateLog --> Confirmed[Confirmed State]
```

**Sales Challan Confirmation Sequence**:

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Ctrl as Challan Controller
    participant Svc as Challan Service
    participant DB as Prisma Transaction

    FE->>Ctrl: POST /challans/:id/confirm
    Ctrl->>Svc: confirmChallan(id)
    Svc->>DB: Start Transaction
    DB->>DB: Check Challan == DRAFT
    DB->>DB: Check Product Stocks >= Item Qty
    alt Insufficient Stock
        DB-->>Svc: Throw Error
        Svc-->>Ctrl: Abort Transaction
        Ctrl-->>FE: 400 Bad Request
    else Sufficient Stock
        DB->>DB: Update Challan Status -> CONFIRMED
        DB->>DB: For each item: currentStock -= Qty
        DB->>DB: For each item: Create StockMovement (OUT)
        DB-->>Svc: Transaction Success
        Svc-->>Ctrl: Returns Challan
        Ctrl-->>FE: 200 OK
    end
```

---

## Section 10 — Product Management Flow

Products are managed by WAREHOUSE and ADMIN roles.
- The `ProductController` handles creation, updates, and fetching.
- Fields include `sku`, `name`, `unitPrice`, `minStockAlert`, and `location`.
- The frontend `ProductsPage` enables global search and dynamic client-side filtering for Low Stock based on strict logic (`0 < currentStock < minStockAlert`).

**Product Management Flow**:
```mermaid
flowchart TD
    Page[Product Page] --> Filters[Search / Category / Low Stock Filters]
    Filters --> API[GET /api/products]
    API --> List[Render Product List]

    List --> ClickRow[Select Product]
    ClickRow --> DetailPage[Product Detail View]

    DetailPage --> Info[Product Information]
    DetailPage --> Inv[Inventory Information]
```

---

## Section 11 — Customer / CRM Flow

Customers are managed by SALES and ADMIN roles.
- `CustomerController` manages creation and status updates.
- Deep linkage via `customer_followups` allowing Sales representatives to leave notes on accounts for future review.
- Accounts are paginated on the backend to handle large CRM databases efficiently.

**Customer / CRM Flow**:
```mermaid
flowchart TD
    CRM[CRM Dashboard] --> Search[Search Customers]
    Search --> API[GET /api/customers]
    API --> List[Customer List]

    List --> ClickCust[Select Customer]
    ClickCust --> Detail[Customer Detail View]

    Detail --> Status[View/Update Status]
    Detail --> FollowUpList[View Follow-ups]
    Detail --> AddFollowUp[Add New Follow-up]

    AddFollowUp --> PostAPI[POST /api/customers/:id/followups]
    PostAPI --> UpdateList[Refresh Follow-ups]
```

---

## Section 12 — Security Architecture

- **Stateless Tokens**: JWTs prevent session hijacking and cross-site request forgery when used with authorization headers instead of cookies.
- **Passwords**: Hashed with robust salt rounds using `bcryptjs`.
- **Validation**: `zod` acts as a firewall, ensuring no malicious or malformed payloads ever reach the database queries.
- **CORS**: Explicitly restricted in `.env` (`CORS_ORIGIN`).
- **Separation of Concerns**: Frontend UI hiding (UX) vs Server-side RBAC enforcement (Security).

---

## Section 13 — Deployment Architecture

The actual production deployment leverages decoupled platforms:

```mermaid
flowchart TD
    Browser[Client Browser]
    RenderStatic[Render Static Site\nReact SPA]
    RenderWeb[Render Web Service\nNode.js Express API]
    Supabase[(Supabase\nPostgreSQL DB)]

    Browser -->|HTTPS Request| RenderStatic
    Browser -->|Axios REST Calls| RenderWeb
    RenderWeb -->|Prisma Client| Supabase
```

**Production URLs**:
- Frontend: `https://nexus-erp-1szs.onrender.com`
- Backend API: `https://nexus-erp-api-rars.onrender.com`
- Backend Health Check: `https://nexus-erp-api-rars.onrender.com/api/health`

---

## Section 14 — Data Integrity

Data integrity is protected by strict mechanisms enforced by the backend and database:
- **Snapshot Fields**: Challan Items copy product text and price data. If a product is deleted or renamed, past financial challans remain perfectly intact.
- **Transactions**: Prisma `$transaction` guarantees that a challan is never marked as confirmed if the corresponding stock deduction fails.
- **Ledger System**: Inventory amounts are backed by immutable `StockMovement` logs.
- **Unique Constraints**: DB-level uniqueness on `users.email`, `customers.email`, `products.sku`, and `challans.challanNumber`.

---

## Section 15 — Important Design Decisions

- **React + TypeScript**: Provides end-to-end type safety and highly predictable rendering for complex data grids.
- **Prisma ORM**: Chosen for its robust schema definition capabilities, type-safe generated client, and built-in transaction support crucial for financial/inventory systems.
- **Feature-Oriented Structure**: Backend directories group Routes, Controllers, and Services by module (e.g., `customers/`), vastly improving maintainability over flat architectures.
- **Soft Document States**: Challans utilize `DRAFT` and `CONFIRMED` states rather than immediately executing inventory modifications, allowing for sales negotiation and editing before finalization.

---

## Section 16 — Known Limitations

- **Single Warehouse**: The system schema assumes a single physical location for inventory. Multi-warehouse tracking is not fully supported.
- **Printing**: Document printing relies on browser-native `window.print()` functionality rather than backend PDF buffer generation.
- **Email Notifications**: Password resets and customer follow-up alerts currently lack an integrated SMTP email service.

---

## Section 17 — Future Improvements

- **Server-Side PDF Generation**: Generate immutable PDFs for Challans upon confirmation and store them in object storage (AWS S3).
- **Multi-Warehouse Support**: Expand `StockMovement` and `Product` models to include `warehouseId`.
- **Automated Alerts**: Email triggers for low-stock items sent to warehouse managers.
- **Advanced BI Dashboards**: Integration of charting libraries for Sales velocity and CRM conversion reporting.
