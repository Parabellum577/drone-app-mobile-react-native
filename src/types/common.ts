/**
 * Generic type for paginated responses from the API
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
} 