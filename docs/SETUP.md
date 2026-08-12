# NEXUS ERP — Local Development Setup Guide

This guide walks you through setting up and running the NEXUS Mini ERP + CRM Operations Portal locally.

---

## 1. Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: PostgreSQL 17 (or compatible version) running locally on port 5432

---

## 2. Environment Variables

Create `.env` files in both root and `server/` directories:

### Root `.env` (Copy from `.env.example`)
```env
PORT=4000
NODE_ENV=development

# Database Configuration (Local PostgreSQL)
# Create a database named "nexus_erp" before running migrations.
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432/nexus_erp"

JWT_SECRET="nexus-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="24h"

CORS_ORIGIN="http://localhost:5173"

VITE_API_URL="http://localhost:4000/api"
```

---

## 3. Server Setup (`/server`)

```bash
cd server
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed test users and initial data
npx prisma db seed

# Start server in watch mode
npm run dev
```

The Express API server will listen on `http://localhost:4000`.

---

## 4. Client Setup (`/client`)

```bash
cd client
npm install

# Start Vite dev server
npm run dev
```

The React SPA will run on `http://localhost:5173`.

---

## 5. Verification

1. Access `http://localhost:5173/login` in your browser.
2.Use the seeded demonstration accounts listed below and enter the credentials manually on the Login page.(e.g. Admin `admin@nexus.com` / `Admin@123`).
3. Click **Sign In** to log into the authenticated dashboard.
