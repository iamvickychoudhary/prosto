import { PaginatedResult, PaginationMeta } from '../dto/pagination.dto';

/**
 * Response Helper Functions
 */

/**
 * Standard success response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(items: T[], pagination: PaginationMeta): PaginatedResult<T> {
  return {
    items,
    pagination,
  };
}

/**
 * Create empty paginated response
 */
export function emptyPaginatedResponse<T>(
  page: number = 1,
  limit: number = 10,
): PaginatedResult<T> {
  return {
    items: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

/**
 * Create deleted response
 */
export function deletedResponse(id: string | number): SuccessResponse<{ id: string | number }> {
  return {
    success: true,
    data: { id },
    message: 'Resource deleted successfully',
  };
}
