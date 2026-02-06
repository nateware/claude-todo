/**
 * Base API client utilities
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with error handling
 * @param endpoint - API endpoint (e.g., '/api/todos')
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse response body
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || 'Error',
        data.message || 'An error occurred'
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other fetch failure
    if (error instanceof TypeError) {
      throw new ApiError(0, 'Network Error', 'Unable to connect to server');
    }

    // Unknown error
    throw new ApiError(500, 'Unknown Error', 'An unexpected error occurred');
  }
}
