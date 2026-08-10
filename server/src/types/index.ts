import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
