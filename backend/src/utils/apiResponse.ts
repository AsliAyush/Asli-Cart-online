import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types/index.js';

export class ResponseFormatter {
  static success<T>(res: Response, message: string, data?: T, statusCode = 200): Response {
    const responsePayload: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(responsePayload);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, 201);
  }

  static error(res: Response, message: string, statusCode = 500, errors?: any): Response {
    const responsePayload: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(responsePayload);
  }

  static paginated<T>(
    res: Response,
    items: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedPayload: ApiResponse<PaginatedResult<T>> = {
      success: true,
      message,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
    return res.status(200).json(paginatedPayload);
  }
}

