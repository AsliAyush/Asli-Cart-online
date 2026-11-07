import { Request } from 'express';

export interface JwtTokenPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  tokenVersion?: number;
}

export interface AuthenticatedUser {
  id: string;
  userId?: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

