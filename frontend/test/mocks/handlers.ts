import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3000';

export const handlers = [
  // GET /api/todos
  http.get(`${API_BASE_URL}/api/todos`, () => {
    return HttpResponse.json([
      {
        id: 1,
        text: 'Test todo 1',
        completed: false,
        createdAt: Date.now(),
        sortOrder: 0,
      },
      {
        id: 2,
        text: 'Test todo 2',
        completed: false,
        createdAt: Date.now() - 1000,
        sortOrder: 1,
      },
    ]);
  }),

  // POST /api/todos
  http.post(`${API_BASE_URL}/api/todos`, async ({ request }) => {
    const body = await request.json() as { text: string };
    return HttpResponse.json(
      {
        id: 3,
        text: body.text,
        completed: false,
        createdAt: Date.now(),
        sortOrder: 0,
      },
      { status: 201 }
    );
  }),

  // PATCH /api/todos/:id/complete
  http.patch(`${API_BASE_URL}/api/todos/:id/complete`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      text: 'Test todo',
      completed: true,
      createdAt: Date.now(),
      sortOrder: 0,
    });
  }),

  // DELETE /api/todos/:id
  http.delete(`${API_BASE_URL}/api/todos/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /api/todos/:id/reorder
  http.patch(`${API_BASE_URL}/api/todos/:id/reorder`, async ({ params, request }) => {
    const body = await request.json() as { fromIndex: number; toIndex: number };
    return HttpResponse.json({
      id: Number(params.id),
      text: 'Test todo',
      completed: false,
      createdAt: Date.now(),
      sortOrder: body.toIndex,
    });
  }),
];
