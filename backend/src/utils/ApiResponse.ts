import { Response } from 'express';

/**
 * Standardized API response helper.
 * Ensures every endpoint returns a consistent shape:
 *   { success: boolean, data?: T, message?: string }
 */
class ApiResponse {
  /**
   * Send a success response.
   */
  static success<T>(res: Response, data: T, statusCode = 200, message?: string): Response {
    return res.status(statusCode).json({
      success: true,
      ...(message && { message }),
      data,
    });
  }

  /**
   * Send a created (201) response.
   */
  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response.
   */
  static error(res: Response, statusCode: number, message: string): Response {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  /**
   * Send a paginated response.
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      pagination,
    });
  }
}

export default ApiResponse;
