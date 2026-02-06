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
      // Use transaction to shift existing todos and insert new one at position 0
      const insertAtTop = fastify.db.transaction(() => {
        // Shift all active todos down by 1
        fastify.db.prepare(
          'UPDATE todos SET sort_order = sort_order + 1 WHERE completed = 0'
        ).run();

        // Insert new todo with sort_order = 0
        const result = fastify.db.prepare(
          'INSERT INTO todos (text, completed, created_at, sort_order) VALUES (?, ?, ?, ?)'
        ).run(trimmedText, 0, createdAt, 0);

        return result;
      });

      const result = insertAtTop();

      reply.code(201).send({
        id: result.lastInsertRowid,
        text: trimmedText,
        completed: false,
        createdAt,
        sortOrder: 0
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
        'SELECT * FROM todos ORDER BY completed ASC, sort_order ASC'
      ).all();

      return rows.map(row => ({
        id: row.id,
        text: row.text,
        completed: !!row.completed,
        createdAt: row.created_at,
        sortOrder: row.sort_order
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
      // Use transaction to handle sort_order when moving between tabs
      const toggleComplete = fastify.db.transaction(() => {
        const todo = fastify.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

        if (!todo) {
          throw new Error('Todo not found');
        }

        const oldCompleted = todo.completed;
        const newCompleted = oldCompleted ? 0 : 1;
        const oldSortOrder = todo.sort_order;

        // Step 1: Remove from old list (shift items below up)
        fastify.db.prepare(
          'UPDATE todos SET sort_order = sort_order - 1 WHERE completed = ? AND sort_order > ?'
        ).run(oldCompleted, oldSortOrder);

        // Step 2: Make room in new list (shift all down)
        fastify.db.prepare(
          'UPDATE todos SET sort_order = sort_order + 1 WHERE completed = ?'
        ).run(newCompleted);

        // Step 3: Toggle completion and place at top (sort_order = 0)
        fastify.db.prepare(
          'UPDATE todos SET completed = ?, sort_order = 0 WHERE id = ?'
        ).run(newCompleted, id);

        return { ...todo, completed: newCompleted, sort_order: 0 };
      });

      const result = toggleComplete();

      return {
        id: result.id,
        text: result.text,
        completed: !!result.completed,
        createdAt: result.created_at,
        sortOrder: result.sort_order
      };
    } catch (error) {
      if (error.message === 'Todo not found') {
        return reply.notFound('Todo not found');
      }
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
      // Use transaction to delete and maintain sort_order
      const deleteWithReorder = fastify.db.transaction(() => {
        const todo = fastify.db.prepare('SELECT completed, sort_order FROM todos WHERE id = ?').get(id);

        if (!todo) {
          throw new Error('Todo not found');
        }

        // Delete todo
        fastify.db.prepare('DELETE FROM todos WHERE id = ?').run(id);

        // Shift items below up
        fastify.db.prepare(
          'UPDATE todos SET sort_order = sort_order - 1 WHERE completed = ? AND sort_order > ?'
        ).run(todo.completed, todo.sort_order);
      });

      deleteWithReorder();

      reply.code(204).send();
    } catch (error) {
      if (error.message === 'Todo not found') {
        return reply.notFound('Todo not found');
      }
      fastify.log.error(error);
      return reply.internalServerError('Failed to delete todo');
    }
  });

  // PATCH /api/todos/:id/reorder - Reorder todo within its list
  fastify.patch('/:id/reorder', async (request, reply) => {
    const id = parseInt(request.params.id, 10);
    const { fromIndex, toIndex } = request.body;

    // Validation
    if (isNaN(id) || id <= 0) {
      return reply.badRequest('Invalid todo ID');
    }

    if (!Number.isInteger(fromIndex) || fromIndex < 0) {
      return reply.badRequest('fromIndex must be a non-negative integer');
    }

    if (!Number.isInteger(toIndex) || toIndex < 0) {
      return reply.badRequest('toIndex must be a non-negative integer');
    }

    if (fromIndex === toIndex) {
      return reply.badRequest('fromIndex and toIndex must be different');
    }

    try {
      // Get todo to verify it exists and get its completion status
      const todo = fastify.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

      if (!todo) {
        return reply.notFound('Todo not found');
      }

      // Verify fromIndex matches current sort_order
      if (todo.sort_order !== fromIndex) {
        return reply.badRequest('fromIndex does not match current position');
      }

      const completed = todo.completed;

      // Use transaction for atomic updates
      const reorder = fastify.db.transaction(() => {
        if (fromIndex < toIndex) {
          // Moving DOWN: decrement items in range (fromIndex, toIndex]
          fastify.db.prepare(
            'UPDATE todos SET sort_order = sort_order - 1 WHERE completed = ? AND sort_order > ? AND sort_order <= ?'
          ).run(completed, fromIndex, toIndex);
        } else {
          // Moving UP: increment items in range [toIndex, fromIndex)
          fastify.db.prepare(
            'UPDATE todos SET sort_order = sort_order + 1 WHERE completed = ? AND sort_order >= ? AND sort_order < ?'
          ).run(completed, toIndex, fromIndex);
        }

        // Update dragged item to new position
        fastify.db.prepare(
          'UPDATE todos SET sort_order = ? WHERE id = ?'
        ).run(toIndex, id);
      });

      reorder();

      // Return updated todo
      const updatedTodo = fastify.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

      return {
        id: updatedTodo.id,
        text: updatedTodo.text,
        completed: !!updatedTodo.completed,
        createdAt: updatedTodo.created_at,
        sortOrder: updatedTodo.sort_order
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.internalServerError('Failed to reorder todo');
    }
  });
};
