import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Handle custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: formattedDetails,
      },
    });
  }

  // Handle Prisma Known Request Errors (Unique constraint, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with this ${target} already exists`,
          details: { target },
        },
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Requested record was not found',
        },
      });
    }
  }

  // Unhandled errors
  console.error('🔥 Internal Server Error:', err);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server'
      : err.message || 'Internal Server Error';

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};
