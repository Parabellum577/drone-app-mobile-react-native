/**
 * Generic type for paginated responses from the API
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Alias for Paginated for more consistent naming
 */
export type PaginatedResponse<T> = Paginated<T>;

/**
 * Common query parameters for paginated requests
 */
export interface PaginatedQuery {
  limit?: number;
  offset?: number;
} 