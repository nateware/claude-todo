import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/mocks/server';
import { TodoApp } from './TodoApp';

describe('TodoApp Integration Tests', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  // Flow 1: Load and display todos
  test('renders active tab by default', async () => {
    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    render(<TodoApp />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays active todos only in active tab', async () => {
    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Active todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
          { id: 2, text: 'Completed todo', completed: true, createdAt: Date.now(), sortOrder: 0 },
        ]);
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Active todo')).toBeInTheDocument();
    });

    expect(screen.queryByText('Completed todo')).not.toBeInTheDocument();
  });

  // Flow 2: Add new todo
  test('opens dialog when add button clicked', async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new todo');
    await user.click(addButton);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('adds new todo and appears at top', async () => {
    const user = userEvent.setup();
    let todos = [
      { id: 1, text: 'Existing todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
    ];

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json(todos);
      }),
      http.post('http://localhost:3000/api/todos', async ({ request }) => {
        const body = await request.json() as { text: string };
        const newTodo = {
          id: 2,
          text: body.text,
          completed: false,
          createdAt: Date.now(),
          sortOrder: 0,
        };
        todos = [newTodo, ...todos];
        return HttpResponse.json(newTodo, { status: 201 });
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Existing todo')).toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new todo');
    await user.click(addButton);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New todo');

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.getByText('New todo')).toBeInTheDocument();
    });
  });

  test('dialog closes after adding todo', async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new todo');
    await user.click(addButton);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New todo');

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  // Flow 3: Toggle completion
  test('toggles todo completion with optimistic update', async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByLabelText('Mark todo as complete');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      // After toggle, todo should move to completed tab and disappear from active tab
      expect(screen.queryByText('Test todo 1')).not.toBeInTheDocument();
    });
  });

  test('completed todo appears in completed tab', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Test todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
        ]);
      }),
      http.patch('http://localhost:3000/api/todos/:id/complete', () => {
        return HttpResponse.json({
          id: 1,
          text: 'Test todo',
          completed: true,
          createdAt: Date.now(),
          sortOrder: 0,
        });
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Mark todo as complete');
    await user.click(checkbox);

    // Switch to completed tab
    const completedTab = screen.getByText(/Completed/);
    await user.click(completedTab);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });

  // Flow 4: Delete todo
  test('shows confirmation dialog when delete clicked', async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete todo');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  test('deletes todo after confirmation', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Todo to delete', completed: false, createdAt: Date.now(), sortOrder: 0 },
        ]);
      }),
      http.delete('http://localhost:3000/api/todos/:id', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Todo to delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete todo');
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Todo to delete')).not.toBeInTheDocument();
    });
  });

  test('cancel delete keeps todo', async () => {
    const user = userEvent.setup();

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Delete todo');
    await user.click(deleteButtons[0]);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
  });

  // Flow 5: Tab switching
  test('switches between active and completed tabs', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Active todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
          { id: 2, text: 'Completed todo', completed: true, createdAt: Date.now(), sortOrder: 0 },
        ]);
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Active todo')).toBeInTheDocument();
    });

    expect(screen.queryByText('Completed todo')).not.toBeInTheDocument();

    // Switch to completed tab
    const completedTab = screen.getByText(/Completed/);
    await user.click(completedTab);

    expect(screen.getByText('Completed todo')).toBeInTheDocument();
    expect(screen.queryByText('Active todo')).not.toBeInTheDocument();
  });

  // Flow 6: Error handling
  test('shows error dialog on API failure', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Test todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
        ]);
      }),
      http.post('http://localhost:3000/api/todos', () => {
        return HttpResponse.json(
          { error: 'Internal Server Error', message: 'Database connection failed' },
          { status: 500 }
        );
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new todo');
    await user.click(addButton);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New todo');

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
  });

  test('error dialog can be dismissed', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json(
          { error: 'Error', message: 'Failed to load todos' },
          { status: 500 }
        );
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load todos')).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.queryByText('Failed to load todos')).not.toBeInTheDocument();
    });
  });

  // Flow 7: API failure rollback
  test('rolls back optimistic update on toggle failure', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Test todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
        ]);
      }),
      http.patch('http://localhost:3000/api/todos/:id/complete', () => {
        return HttpResponse.json(
          { error: 'Error', message: 'Failed to toggle' },
          { status: 500 }
        );
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Mark todo as complete');
    await user.click(checkbox);

    // Error dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Failed to toggle')).toBeInTheDocument();
    });

    // Todo should still be in active tab (rollback successful)
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });

  test('rolls back optimistic delete on failure', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('http://localhost:3000/api/todos', () => {
        return HttpResponse.json([
          { id: 1, text: 'Test todo', completed: false, createdAt: Date.now(), sortOrder: 0 },
        ]);
      }),
      http.delete('http://localhost:3000/api/todos/:id', () => {
        return HttpResponse.json(
          { error: 'Error', message: 'Failed to delete' },
          { status: 500 }
        );
      })
    );

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete todo');
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    // Error dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument();
    });

    // Dismiss error
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    // Todo should still exist (rollback successful)
    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });
});
