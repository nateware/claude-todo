/**
 * Todo API Routes
 * Provides CRUD operations for todos with SQLite persistence
 */

module.exports = async function (fastify, opts) {
  // POST /api/todos - Create new todo
  fastify.post('/', async (request, reply) => {
    const { text } = request.body;

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return reply.badRequest('Todo text is required and must be a non-empty string');
    }

    if (text.trim().length > 500) {
      return reply.badRequest('Todo text must be 500 characters or less');
    }

    const createdAt = Date.now();
    const trimmedText = text.trim();

    try {
      const result = fastify.db.prepare(
        'INSERT INTO todos (text, completed, created_at) VALUES (?, ?, ?)'
      ).run(trimmedText, 0, createdAt);

      reply.code(201).send({
        id: result.lastInsertRowid,
        text: trimmedText,
        completed: false,
        createdAt
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to create todo');
    }
  });

  // GET /api/todos - Retrieve all todos
  fastify.get('/', async (request, reply) => {
    try {
      const rows = fastify.db.prepare(
        'SELECT * FROM todos ORDER BY created_at DESC'
      ).all();

      return rows.map(row => ({
        id: row.id,
        text: row.text,
        completed: !!row.completed,
        createdAt: row.created_at
      }));
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to retrieve todos');
    }
  });

  // PATCH /api/todos/:id/complete - Toggle todo completion
  fastify.patch('/:id/complete', async (request, reply) => {
    const id = parseInt(request.params.id, 10);

    // Validate ID is a valid integer
    if (isNaN(id) || id <= 0) {
      return reply.badRequest('Invalid todo ID');
    }

    try {
      // Check if todo exists
      const todo = fastify.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

      if (!todo) {
        return reply.notFound('Todo not found');
      }

      // Toggle completed status
      const newCompleted = todo.completed ? 0 : 1;
      fastify.db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(newCompleted, id);

      return {
        id: todo.id,
        text: todo.text,
        completed: !!newCompleted,
        createdAt: todo.created_at
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to update todo');
    }
  });

  // DELETE /api/todos/:id - Delete todo
  fastify.delete('/:id', async (request, reply) => {
    const id = parseInt(request.params.id, 10);

    // Validate ID is a valid integer
    if (isNaN(id) || id <= 0) {
      return reply.badRequest('Invalid todo ID');
    }

    try {
      const result = fastify.db.prepare('DELETE FROM todos WHERE id = ?').run(id);

      if (result.changes === 0) {
        return reply.notFound('Todo not found');
      }

      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to delete todo');
    }
  });
};
