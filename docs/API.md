# NEXUS ERP — API Documentation

## Base URL
`http://localhost:4000/api`

---

## 1. System Health

### `GET /api/health`
Check API server status and environment.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "NEXUS ERP API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-08-11T00:00:00.000Z",
    "environment": "development"
  }
}
```

---

## 2. Authentication

### `POST /api/auth/login`
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "admin@nexus.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clyxxxxxx",
      "name": "Priya Sharma",
      "email": "admin@nexus.com",
      "role": "ADMIN",
      "createdAt": "2026-08-11T00:00:00.000Z"
    }
  }
}
```

---

### `GET /api/auth/me`
Retrieve authenticated user profile. Requires Bearer Token.

**Headers:**
`Authorization: Bearer <JWT_TOKEN>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "clyxxxxxx",
    "name": "Priya Sharma",
    "email": "admin@nexus.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-08-11T00:00:00.000Z",
    "updatedAt": "2026-08-11T00:00:00.000Z"
  }
}
```
