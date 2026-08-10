# NEXUS ERP — Production Deployment Guide

NEXUS ERP is designed for zero-downtime serverless deployment across Vercel, Render, and Neon PostgreSQL.

---

## Architecture Topology

- **Database**: Neon PostgreSQL (Pooled `DATABASE_URL` for API server, `DIRECT_URL` for migrations)
- **Backend API**: Render Web Service (Node.js + Express + Prisma)
- **Frontend SPA**: Vercel Static Build (React + Vite)

---

## 1. Database Setup (Neon PostgreSQL)

1. Create a project on [Neon.tech](https://neon.tech).
2. Retrieve the **Pooled Connection String** (`DATABASE_URL`) and **Direct Connection String** (`DIRECT_URL`).

---

## 2. Backend Deployment (Render)

1. Connect your GitHub repository to Render.
2. Select **New Web Service** and set root directory to `server`.
3. Set **Build Command**: `npm install && npx prisma generate && npm run build`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://nexus-erp-frontend.vercel.app`
6. Set Health Check Path: `/api/health`
7. Once deployed, run initial migration & seed command via Render Shell:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set Root Directory to `client`.
3. Build & Output Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL=https://nexus-erp-backend.onrender.com/api`
5. Deploy. Rewrites in Vite static hosting automatically handle client-side SPA routing (`/app/*` -> `/index.html`).
