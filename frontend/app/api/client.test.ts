import { describe, test, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { apiFetch, ApiError } from './client';

describe('apiFetch', () => {
  const API_BASE_URL = 'http://localhost:3000';

  beforeEach(() => {
    // Reset handlers before each test
    server.resetHandlers();
  });

  test('makes fetch request with correct URL', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json({ success: true });
      })
    );

    const result = await apiFetch<{ success: boolean }>('/test');
    expect(result).toEqual({ success: true });
  });

  test('sets Content-Type header when body present', async () => {
    let receivedHeaders: Headers | null = null;

    server.use(
      http.post(`${API_BASE_URL}/test`, async ({ request }) => {
        receivedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      })
    );

    await apiFetch('/test', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    expect(receivedHeaders?.get('content-type')).toBe('application/json');
  });

  test('omits Content-Type when no body', async () => {
    let receivedHeaders: Headers | null = null;

    server.use(
      http.get(`${API_BASE_URL}/test`, ({ request }) => {
        receivedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      })
    );

    await apiFetch('/test');

    expect(receivedHeaders?.get('content-type')).toBeNull();
  });

  test('handles 204 No Content (returns undefined)', async () => {
    server.use(
      http.delete(`${API_BASE_URL}/test`, () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await apiFetch<void>('/test', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });

  test('parses JSON response', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json({ id: 1, name: 'Test' });
      })
    );

    const result = await apiFetch<{ id: number; name: string }>('/test');
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  test('throws ApiError with correct fields on error response', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json(
          {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid input',
          },
          { status: 400 }
        );
      })
    );

    await expect(apiFetch('/test')).rejects.toThrow(ApiError);

    try {
      await apiFetch('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.statusCode).toBe(400);
        expect(error.error).toBe('Bad Request');
        expect(error.message).toBe('Invalid input');
      }
    }
  });

  test('throws ApiError with statusCode 0 on network error', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.error();
      })
    );

    await expect(apiFetch('/test')).rejects.toThrow(ApiError);

    try {
      await apiFetch('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.statusCode).toBe(0);
        expect(error.message).toBe('Unable to connect to server');
      }
    }
  });

  test('re-throws ApiError unchanged', async () => {
    const originalError = new ApiError(404, 'Not Found', 'Resource not found');

    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            message: 'Resource not found',
          },
          { status: 404 }
        );
      })
    );

    try {
      await apiFetch('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.statusCode).toBe(404);
        expect(error.error).toBe('Not Found');
        expect(error.message).toBe('Resource not found');
      }
    }
  });

  test('handles 500 errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json(
          {
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'Database error',
          },
          { status: 500 }
        );
      })
    );

    try {
      await apiFetch('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.statusCode).toBe(500);
      }
    }
  });

  test('uses default error values when not provided', async () => {
    server.use(
      http.get(`${API_BASE_URL}/test`, () => {
        return HttpResponse.json({}, { status: 400 });
      })
    );

    try {
      await apiFetch('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.error).toBe('Error');
        expect(error.message).toBe('An error occurred');
      }
    }
  });
});
