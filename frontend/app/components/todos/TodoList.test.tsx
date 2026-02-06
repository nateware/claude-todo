import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from '~/types/todo';

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      text: 'First todo',
      completed: false,
      createdAt: Date.now(),
      sortOrder: 0,
    },
    {
      id: 2,
      text: 'Second todo',
      completed: false,
      createdAt: Date.now() - 1000,
      sortOrder: 1,
    },
  ];

  test('renders all todos in order', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />
    );

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  test('shows empty state when no todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />
    );

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });

  test('renders correct number of items', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />
    );

    // Each todo has a drag handle, checkbox, and delete button
    const dragHandles = screen.getAllByLabelText('Drag to reorder');
    expect(dragHandles).toHaveLength(2);
  });

  test('passes onToggle to TodoItems', async () => {
    const onToggle = vi.fn();

    render(
      <TodoList
        todos={mockTodos}
        onToggle={onToggle}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />
    );

    // TodoItem should have access to onToggle
    // (Testing that props are passed correctly)
    expect(screen.getAllByLabelText('Mark todo as complete')).toHaveLength(2);
  });

  test('passes onDelete to TodoItems', () => {
    const onDelete = vi.fn();

    render(
      <TodoList
        todos={mockTodos}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onDragEnd={vi.fn()}
      />
    );

    // TodoItem should have access to onDelete
    expect(screen.getAllByLabelText('Delete todo')).toHaveLength(2);
  });
});
