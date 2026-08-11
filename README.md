# NEXUS — Mini ERP + CRM Operations Portal

> Full-stack internal operations portal built for wholesale and distribution businesses. Built by **Arnav Jagetiya**.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6, TanStack Query v5, Axios, Tailwind CSS v4
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM 5+, PostgreSQL, JWT, bcrypt, Zod
- **Architecture**: Monorepo (`/client` + `/server`), REST API, Stateless JWT Auth, Server-side RBAC

---

## Repository Structure

```
nexus-erp/
├── client/                  # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── api/             # Axios instance & interceptors
│   │   ├── components/      # UI, Layout, & Feedback components
│   │   ├── features/        # Feature modules (Auth, Dashboard, etc.)
│   │   ├── hooks/           # Custom React hooks (useAuth, useTheme)
│   │   ├── lib/             # Utility functions
│   │   ├── providers/       # AuthProvider, ThemeProvider, QueryProvider
│   │   ├── routes/          # React Router & ProtectedRoute guards
│   │   ├── styles/          # Tailwind CSS v4 design tokens & theme setup
│   │   └── types/           # Shared TypeScript interfaces
├── server/                  # Node.js + Express + TypeScript Backend
│   ├── prisma/              # Schema, migrations, & seed scripts
│   ├── src/
│   │   ├── config/          # Environment validation (Zod) & Prisma client
│   │   ├── middleware/      # Auth, RBAC, Validation, Error Handler
│   │   ├── modules/         # Auth module (routes, controller, service, schema)
│   │   ├── utils/           # ApiError, ApiResponse helpers
│   │   └── types/           # Backend type definitions
├── docs/                    # Documentation guides
├── .env.example             # Environment variables template
└── README.md
```

---

## Test Credentials (Seeded Roles)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@nexus.com` | `Admin@123` | Full system access |
| **SALES** | `sales@nexus.com` | `Sales@123` | Customer CRM & Sales Challans |
| **WAREHOUSE** | `warehouse@nexus.com` | `Warehouse@123` | Products & Inventory Management |
| **ACCOUNTS** | `accounts@nexus.com` | `Accounts@123` | Read-only financial audit access |

---

## Local Setup & Development

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL 17 (or compatible version) running locally on port 5432

### 2. Backend Setup (`/server`)

```bash
cd server
npm install

# Copy environment variables
cp ../.env.example .env

# 1. Ensure local PostgreSQL is running and you have created a database named 'nexus_erp'
# 2. Configure server/.env with your local database credentials
# 3. Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Database with Test Credentials
npx prisma db seed

# Run Backend Development Server
npm run dev
```

Server runs on: `http://localhost:4000`  
Health check endpoint: `GET http://localhost:4000/api/health`

### 3. Verification

You can import the Postman collection (`nexus-erp.postman_collection.json`) to test API endpoints directly.

### 4. Frontend Setup (`/client`)

```bash
cd client
npm install

# Copy environment variables
cp ../.env.example .env

# Run Frontend Development Server
npm run dev
```

Client runs on: `http://localhost:5173`

---

## License

Internal Enterprise Operations System. Built by Arnav Jagetiya. All rights reserved.
