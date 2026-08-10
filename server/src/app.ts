import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/apiError.js';
import { ApiResponse } from './utils/apiResponse.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

// Middleware Stack
app.use(
  cors({
    origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
    'NEXUS ERP API is healthy'
  );
});

// API Routes
app.use('/api/auth', authRoutes);

// Catch-all 404 Route Handler
app.use('*', (req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
