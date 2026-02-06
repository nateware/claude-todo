import { describe, test, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { todoApi } from './todos';

describe('todoApi', () => {
  const API_BASE_URL = 'http://localhost:3000';

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('getAll', () => {
    test('calls GET /api/todos', async () => {
      const mockTodos = [
        { id: 1, text: 'Todo 1', completed: false, createdAt: Date.now(), sortOrder: 0 },
        { id: 2, text: 'Todo 2', completed: true, createdAt: Date.now(), sortOrder: 1 },
      ];

      server.use(
        http.get(`${API_BASE_URL}/api/todos`, () => {
          return HttpResponse.json(mockTodos);
        })
      );

      const result = await todoApi.getAll();
      expect(result).toEqual(mockTodos);
    });

    test('returns empty array when no todos', async () => {
      server.use(
        http.get(`${API_BASE_URL}/api/todos`, () => {
          return HttpResponse.json([]);
        })
      );

      const result = await todoApi.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    test('calls POST /api/todos with correct body', async () => {
      let receivedBody: any = null;

      server.use(
        http.post(`${API_BASE_URL}/api/todos`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(
            {
              id: 3,
              text: receivedBody.text,
              completed: false,
              createdAt: Date.now(),
              sortOrder: 0,
            },
            { status: 201 }
          );
        })
      );

      const result = await todoApi.create('New todo');

      expect(receivedBody).toEqual({ text: 'New todo' });
      expect(result.text).toBe('New todo');
      expect(result.completed).toBe(false);
    });

    test('returns 201 status', async () => {
      server.use(
        http.post(`${API_BASE_URL}/api/todos`, () => {
          return HttpResponse.json(
            {
              id: 1,
              text: 'Test',
              completed: false,
              createdAt: Date.now(),
              sortOrder: 0,
            },
            { status: 201 }
          );
        })
      );

      const result = await todoApi.create('Test');
      expect(result.id).toBe(1);
    });
  });

  describe('toggleComplete', () => {
    test('calls PATCH /api/todos/:id/complete with correct URL', async () => {
      let calledId: string | undefined;

      server.use(
        http.patch(`${API_BASE_URL}/api/todos/:id/complete`, ({ params }) => {
          calledId = params.id as string;
          return HttpResponse.json({
            id: Number(params.id),
            text: 'Test',
            completed: true,
            createdAt: Date.now(),
            sortOrder: 0,
          });
        })
      );

      await todoApi.toggleComplete(42);
      expect(calledId).toBe('42');
    });

    test('returns updated todo', async () => {
      server.use(
        http.patch(`${API_BASE_URL}/api/todos/:id/complete`, ({ params }) => {
          return HttpResponse.json({
            id: Number(params.id),
            text: 'Toggled todo',
            completed: true,
            createdAt: Date.now(),
            sortOrder: 0,
          });
        })
      );

      const result = await todoApi.toggleComplete(1);
      expect(result.completed).toBe(true);
      expect(result.text).toBe('Toggled todo');
    });
  });

  describe('delete', () => {
    test('calls DELETE /api/todos/:id with correct URL', async () => {
      let calledId: string | undefined;

      server.use(
        http.delete(`${API_BASE_URL}/api/todos/:id`, ({ params }) => {
          calledId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      await todoApi.delete(42);
      expect(calledId).toBe('42');
    });

    test('handles 204 No Content response', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/api/todos/:id`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await todoApi.delete(1);
      expect(result).toBeUndefined();
    });
  });

  describe('reorder', () => {
    test('calls PATCH /api/todos/:id/reorder with correct URL and body', async () => {
      let calledId: string | undefined;
      let receivedBody: any = null;

      server.use(
        http.patch(`${API_BASE_URL}/api/todos/:id/reorder`, async ({ params, request }) => {
          calledId = params.id as string;
          receivedBody = await request.json();
          return HttpResponse.json({
            id: Number(params.id),
            text: 'Test',
            completed: false,
            createdAt: Date.now(),
            sortOrder: receivedBody.toIndex,
          });
        })
      );

      await todoApi.reorder(5, 0, 2);

      expect(calledId).toBe('5');
      expect(receivedBody).toEqual({ fromIndex: 0, toIndex: 2 });
    });

    test('returns updated todo with new sortOrder', async () => {
      server.use(
        http.patch(`${API_BASE_URL}/api/todos/:id/reorder`, async ({ params, request }) => {
          const body = await request.json() as { fromIndex: number; toIndex: number };
          return HttpResponse.json({
            id: Number(params.id),
            text: 'Reordered todo',
            completed: false,
            createdAt: Date.now(),
            sortOrder: body.toIndex,
          });
        })
      );

      const result = await todoApi.reorder(1, 0, 3);
      expect(result.sortOrder).toBe(3);
      expect(result.text).toBe('Reordered todo');
    });
  });
});
