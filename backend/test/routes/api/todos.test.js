const { test } = require('node:test');
const assert = require('node:assert');
const { buildWithTestDb } = require('../../helper');
const { createTestDb, seedTestDb } = require('../../setup');

// =============================================================================
// POST /api/todos
// =============================================================================

test('POST /api/todos creates todo with valid text', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: 'Buy groceries' }
  });

  assert.equal(res.statusCode, 201);
  const todo = JSON.parse(res.payload);
  assert.equal(todo.text, 'Buy groceries');
  assert.equal(todo.completed, false);
  assert.equal(todo.sortOrder, 0);
  assert.ok(todo.id);
  assert.ok(todo.createdAt);
});

test('POST /api/todos - new todo appears at sortOrder=0', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Existing todo 1', completed: false, sortOrder: 0 },
    { text: 'Existing todo 2', completed: false, sortOrder: 1 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: 'New todo' }
  });

  assert.equal(res.statusCode, 201);
  const todo = JSON.parse(res.payload);
  assert.equal(todo.sortOrder, 0);
});

test('POST /api/todos - existing todos shifted down', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: 'New todo' }
  });

  // Check that existing todos were shifted
  const todos = testDb.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY sort_order').all();
  assert.equal(todos[0].text, 'New todo');
  assert.equal(todos[0].sort_order, 0);
  assert.equal(todos[1].text, 'Todo 1');
  assert.equal(todos[1].sort_order, 1);
  assert.equal(todos[2].text, 'Todo 2');
  assert.equal(todos[2].sort_order, 2);
});

test('POST /api/todos trims whitespace from text', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: '  Buy groceries  ' }
  });

  assert.equal(res.statusCode, 201);
  const todo = JSON.parse(res.payload);
  assert.equal(todo.text, 'Buy groceries');
});

test('POST /api/todos returns 400 when text is missing', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: {}
  });

  assert.equal(res.statusCode, 400);
  const error = JSON.parse(res.payload);
  assert.ok(error.message.includes('required'));
});

test('POST /api/todos returns 400 when text is empty string', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: '' }
  });

  assert.equal(res.statusCode, 400);
});

test('POST /api/todos returns 400 when text is only whitespace', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: '   ' }
  });

  assert.equal(res.statusCode, 400);
});

test('POST /api/todos returns 400 when text exceeds 500 characters', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const longText = 'a'.repeat(501);
  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: longText }
  });

  assert.equal(res.statusCode, 400);
  const error = JSON.parse(res.payload);
  assert.ok(error.message.includes('500'));
});

test('POST /api/todos returns 400 when text is not a string (number)', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: 12345 }
  });

  assert.equal(res.statusCode, 400);
});

test('POST /api/todos returns 400 when text is not a string (object)', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: { value: 'test' } }
  });

  assert.equal(res.statusCode, 400);
});

test('POST /api/todos returns 400 when text is not a string (array)', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'POST',
    url: '/api/todos',
    payload: { text: ['test'] }
  });

  assert.equal(res.statusCode, 400);
});

// =============================================================================
// GET /api/todos
// =============================================================================

test('GET /api/todos returns empty array when no todos', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  assert.equal(res.statusCode, 200);
  const todos = JSON.parse(res.payload);
  assert.deepEqual(todos, []);
});

test('GET /api/todos returns all todos with correct structure', async (t) => {
  const testDb = createTestDb();
  const now = Date.now();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, createdAt: now, sortOrder: 0 },
    { text: 'Todo 2', completed: true, createdAt: now + 1000, sortOrder: 0 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  assert.equal(res.statusCode, 200);
  const todos = JSON.parse(res.payload);
  assert.equal(todos.length, 2);
  assert.ok(todos[0].id);
  assert.ok(todos[0].text);
  assert.equal(typeof todos[0].completed, 'boolean');
  assert.ok(todos[0].createdAt);
  assert.equal(typeof todos[0].sortOrder, 'number');
});

test('GET /api/todos - active todos appear before completed', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Completed todo', completed: true, sortOrder: 0 },
    { text: 'Active todo', completed: false, sortOrder: 0 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  const todos = JSON.parse(res.payload);
  assert.equal(todos[0].text, 'Active todo');
  assert.equal(todos[1].text, 'Completed todo');
});

test('GET /api/todos - todos sorted by sortOrder within groups', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active 2', completed: false, sortOrder: 1 },
    { text: 'Active 1', completed: false, sortOrder: 0 },
    { text: 'Completed 2', completed: true, sortOrder: 1 },
    { text: 'Completed 1', completed: true, sortOrder: 0 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  const todos = JSON.parse(res.payload);
  assert.equal(todos[0].text, 'Active 1');
  assert.equal(todos[1].text, 'Active 2');
  assert.equal(todos[2].text, 'Completed 1');
  assert.equal(todos[3].text, 'Completed 2');
});

test('GET /api/todos - boolean conversion (0 -> false, 1 -> true)', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active', completed: false, sortOrder: 0 },
    { text: 'Completed', completed: true, sortOrder: 0 }
  ]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  const todos = JSON.parse(res.payload);
  assert.strictEqual(todos[0].completed, false);
  assert.strictEqual(todos[1].completed, true);
});

test('GET /api/todos - camelCase conversion for field names', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test', completed: false, sortOrder: 0 }]);
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'GET',
    url: '/api/todos'
  });

  const todos = JSON.parse(res.payload);
  assert.ok(Object.hasOwn(todos[0], 'createdAt'));
  assert.ok(Object.hasOwn(todos[0], 'sortOrder'));
  assert.ok(!Object.hasOwn(todos[0], 'created_at'));
  assert.ok(!Object.hasOwn(todos[0], 'sort_order'));
});

// =============================================================================
// PATCH /api/todos/:id/complete
// =============================================================================

test('PATCH /:id/complete toggles completion false -> true', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/complete`
  });

  assert.equal(res.statusCode, 200);
  const updated = JSON.parse(res.payload);
  assert.equal(updated.completed, true);
});

test('PATCH /:id/complete toggles completion true -> false', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test todo', completed: true, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/complete`
  });

  assert.equal(res.statusCode, 200);
  const updated = JSON.parse(res.payload);
  assert.equal(updated.completed, false);
});

test('PATCH /:id/complete returns updated todo', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/complete`
  });

  const updated = JSON.parse(res.payload);
  assert.ok(updated.id);
  assert.ok(updated.text);
  assert.equal(typeof updated.completed, 'boolean');
  assert.ok(updated.createdAt);
  assert.equal(typeof updated.sortOrder, 'number');
});

test('PATCH /:id/complete - removed from old list (shift up)', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active 1', completed: false, sortOrder: 0 },
    { text: 'Active 2', completed: false, sortOrder: 1 },
    { text: 'Active 3', completed: false, sortOrder: 2 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 1').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/complete`
  });

  // Check that items below were shifted up
  const active = testDb.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY sort_order').all();
  assert.equal(active.length, 2);
  assert.equal(active[0].text, 'Active 1');
  assert.equal(active[0].sort_order, 0);
  assert.equal(active[1].text, 'Active 3');
  assert.equal(active[1].sort_order, 1);
});

test('PATCH /:id/complete - added to top of new list (sortOrder=0)', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active todo', completed: false, sortOrder: 0 },
    { text: 'Completed 1', completed: true, sortOrder: 0 },
    { text: 'Completed 2', completed: true, sortOrder: 1 }
  ]);
  const active = testDb.prepare('SELECT * FROM todos WHERE completed = 0').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'PATCH',
    url: `/api/todos/${active.id}/complete`
  });

  // Check that todo was added at top
  const toggled = testDb.prepare('SELECT * FROM todos WHERE id = ?').get(active.id);
  assert.equal(toggled.sort_order, 0);
});

test('PATCH /:id/complete - shifts new list down', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active todo', completed: false, sortOrder: 0 },
    { text: 'Completed 1', completed: true, sortOrder: 0 },
    { text: 'Completed 2', completed: true, sortOrder: 1 }
  ]);
  const active = testDb.prepare('SELECT * FROM todos WHERE completed = 0').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'PATCH',
    url: `/api/todos/${active.id}/complete`
  });

  // Check that existing completed were shifted down
  const completed = testDb.prepare('SELECT * FROM todos WHERE completed = 1 AND id != ? ORDER BY sort_order').all(active.id);
  assert.equal(completed[0].text, 'Completed 1');
  assert.equal(completed[0].sort_order, 1);
  assert.equal(completed[1].text, 'Completed 2');
  assert.equal(completed[1].sort_order, 2);
});

test('PATCH /:id/complete returns 400 when id is not a number', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/abc/complete'
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/complete returns 400 when id is negative', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/-1/complete'
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/complete returns 404 when todo not found', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/99999/complete'
  });

  assert.equal(res.statusCode, 404);
});

// =============================================================================
// DELETE /api/todos/:id
// =============================================================================

test('DELETE /:id returns 204', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'DELETE',
    url: `/api/todos/${todo.id}`
  });

  assert.equal(res.statusCode, 204);
  assert.equal(res.payload, '');
});

test('DELETE /:id removes todo from database', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Test todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'DELETE',
    url: `/api/todos/${todo.id}`
  });

  const deleted = testDb.prepare('SELECT * FROM todos WHERE id = ?').get(todo.id);
  assert.strictEqual(deleted, undefined);
});

test('DELETE /:id - items below shifted up', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 }
  ]);
  const todoToDelete = testDb.prepare('SELECT * FROM todos WHERE sort_order = 1').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'DELETE',
    url: `/api/todos/${todoToDelete.id}`
  });

  // Check that items below were shifted up
  const remaining = testDb.prepare('SELECT * FROM todos ORDER BY sort_order').all();
  assert.equal(remaining.length, 2);
  assert.equal(remaining[0].text, 'Todo 1');
  assert.equal(remaining[0].sort_order, 0);
  assert.equal(remaining[1].text, 'Todo 3');
  assert.equal(remaining[1].sort_order, 1);
});

test('DELETE /:id maintains sort order integrity', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active 1', completed: false, sortOrder: 0 },
    { text: 'Active 2', completed: false, sortOrder: 1 },
    { text: 'Completed 1', completed: true, sortOrder: 0 }
  ]);
  const active = testDb.prepare('SELECT * FROM todos WHERE completed = 0 AND sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'DELETE',
    url: `/api/todos/${active.id}`
  });

  // Check active todos shifted correctly
  const activeTodos = testDb.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY sort_order').all();
  assert.equal(activeTodos.length, 1);
  assert.equal(activeTodos[0].sort_order, 0);

  // Check completed todos unaffected
  const completedTodos = testDb.prepare('SELECT * FROM todos WHERE completed = 1').all();
  assert.equal(completedTodos.length, 1);
  assert.equal(completedTodos[0].sort_order, 0);
});

test('DELETE /:id returns 400 when id is invalid', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'DELETE',
    url: '/api/todos/invalid'
  });

  assert.equal(res.statusCode, 400);
});

test('DELETE /:id returns 404 when todo not found', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'DELETE',
    url: '/api/todos/99999'
  });

  assert.equal(res.statusCode, 404);
});

// =============================================================================
// PATCH /api/todos/:id/reorder
// =============================================================================

test('PATCH /:id/reorder - moving down shifts items up', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 },
    { text: 'Todo 4', completed: false, sortOrder: 3 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 2 }
  });

  assert.equal(res.statusCode, 200);

  // Check new order
  const todos = testDb.prepare('SELECT * FROM todos ORDER BY sort_order').all();
  assert.equal(todos[0].text, 'Todo 2');
  assert.equal(todos[1].text, 'Todo 3');
  assert.equal(todos[2].text, 'Todo 1'); // Moved here
  assert.equal(todos[3].text, 'Todo 4');
});

test('PATCH /:id/reorder - moving up shifts items down', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 },
    { text: 'Todo 4', completed: false, sortOrder: 3 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 3').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 3, toIndex: 1 }
  });

  assert.equal(res.statusCode, 200);

  // Check new order
  const todos = testDb.prepare('SELECT * FROM todos ORDER BY sort_order').all();
  assert.equal(todos[0].text, 'Todo 1');
  assert.equal(todos[1].text, 'Todo 4'); // Moved here
  assert.equal(todos[2].text, 'Todo 2');
  assert.equal(todos[3].text, 'Todo 3');
});

test('PATCH /:id/reorder - item placed at toIndex', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 2 }
  });

  const moved = testDb.prepare('SELECT * FROM todos WHERE id = ?').get(todo.id);
  assert.equal(moved.sort_order, 2);
});

test('PATCH /:id/reorder - only affects same completion status', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Active 1', completed: false, sortOrder: 0 },
    { text: 'Active 2', completed: false, sortOrder: 1 },
    { text: 'Completed 1', completed: true, sortOrder: 0 },
    { text: 'Completed 2', completed: true, sortOrder: 1 }
  ]);
  const active = testDb.prepare('SELECT * FROM todos WHERE completed = 0 AND sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  await app.inject({
    method: 'PATCH',
    url: `/api/todos/${active.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 1 }
  });

  // Check completed todos unaffected
  const completed = testDb.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY sort_order').all();
  assert.equal(completed[0].sort_order, 0);
  assert.equal(completed[1].sort_order, 1);
});

test('PATCH /:id/reorder returns updated todo', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 1 }
  });

  const updated = JSON.parse(res.payload);
  assert.ok(updated.id);
  assert.ok(updated.text);
  assert.equal(typeof updated.completed, 'boolean');
  assert.ok(updated.createdAt);
  assert.equal(updated.sortOrder, 1);
});

test('PATCH /:id/reorder returns 400 when id is invalid', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/invalid/reorder',
    payload: { fromIndex: 0, toIndex: 1 }
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/reorder returns 400 when fromIndex is negative', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: -1, toIndex: 0 }
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/reorder returns 400 when toIndex is negative', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: -1 }
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/reorder returns 400 when fromIndex === toIndex', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 0 }
  });

  assert.equal(res.statusCode, 400);
});

test('PATCH /:id/reorder returns 400 when fromIndex does not match current position', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 1').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 1 } // fromIndex should be 1, not 0
  });

  assert.equal(res.statusCode, 400);
  const error = JSON.parse(res.payload);
  assert.ok(error.message.includes('does not match'));
});

test('PATCH /:id/reorder returns 404 when todo not found', async (t) => {
  const testDb = createTestDb();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: '/api/todos/99999/reorder',
    payload: { fromIndex: 0, toIndex: 1 }
  });

  assert.equal(res.statusCode, 404);
});

test('PATCH /:id/reorder - move from index 0 to 5', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 },
    { text: 'Todo 4', completed: false, sortOrder: 3 },
    { text: 'Todo 5', completed: false, sortOrder: 4 },
    { text: 'Todo 6', completed: false, sortOrder: 5 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 0').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 5 }
  });

  assert.equal(res.statusCode, 200);

  const todos = testDb.prepare('SELECT * FROM todos ORDER BY sort_order').all();
  assert.equal(todos[5].text, 'Todo 1');
  assert.equal(todos[5].sort_order, 5);
});

test('PATCH /:id/reorder - move from index 5 to 0', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [
    { text: 'Todo 1', completed: false, sortOrder: 0 },
    { text: 'Todo 2', completed: false, sortOrder: 1 },
    { text: 'Todo 3', completed: false, sortOrder: 2 },
    { text: 'Todo 4', completed: false, sortOrder: 3 },
    { text: 'Todo 5', completed: false, sortOrder: 4 },
    { text: 'Todo 6', completed: false, sortOrder: 5 }
  ]);
  const todo = testDb.prepare('SELECT * FROM todos WHERE sort_order = 5').get();
  const app = await buildWithTestDb(t, testDb);

  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 5, toIndex: 0 }
  });

  assert.equal(res.statusCode, 200);

  const todos = testDb.prepare('SELECT * FROM todos ORDER BY sort_order').all();
  assert.equal(todos[0].text, 'Todo 6');
  assert.equal(todos[0].sort_order, 0);
});

test('PATCH /:id/reorder - single item list does not error', async (t) => {
  const testDb = createTestDb();
  seedTestDb(testDb, [{ text: 'Only todo', completed: false, sortOrder: 0 }]);
  const todo = testDb.prepare('SELECT * FROM todos').get();
  const app = await buildWithTestDb(t, testDb);

  // Can't actually reorder with only one item, but fromIndex === toIndex should be caught
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/todos/${todo.id}/reorder`,
    payload: { fromIndex: 0, toIndex: 0 }
  });

  assert.equal(res.statusCode, 400); // fromIndex === toIndex validation
});
