import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { TodoItem } from './TodoItem';
import type { Todo } from '~/types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: 1,
    text: 'Test todo',
    completed: false,
    createdAt: Date.now(),
    sortOrder: 0,
  };

  // Wrap TodoItem in DndContext for drag-and-drop tests
  const renderTodoItem = (todo: Todo, onToggle = vi.fn(), onDelete = vi.fn()) => {
    return render(
      <DndContext>
        <TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />
      </DndContext>
    );
  };

  test('renders todo text', () => {
    renderTodoItem(mockTodo);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  test('shows drag handle', () => {
    renderTodoItem(mockTodo);
    const dragHandle = screen.getByLabelText('Drag to reorder');
    expect(dragHandle).toBeInTheDocument();
  });

  test('shows checkbox button', () => {
    renderTodoItem(mockTodo);
    const checkbox = screen.getByLabelText('Mark todo as complete');
    expect(checkbox).toBeInTheDocument();
  });

  test('shows delete button', () => {
    renderTodoItem(mockTodo);
    const deleteButton = screen.getByLabelText('Delete todo');
    expect(deleteButton).toBeInTheDocument();
  });

  test('clicking checkbox calls onToggle with id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    renderTodoItem(mockTodo, onToggle);

    const checkbox = screen.getByLabelText('Mark todo as complete');
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(1);
  });

  test('clicking delete calls onDelete with id', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderTodoItem(mockTodo, vi.fn(), onDelete);

    const deleteButton = screen.getByLabelText('Delete todo');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test('drag handle has correct cursor styles', () => {
    renderTodoItem(mockTodo);
    const dragHandle = screen.getByLabelText('Drag to reorder');
    expect(dragHandle.className).toContain('cursor-grab');
    expect(dragHandle.className).toContain('active:cursor-grabbing');
  });

  test('all interactive elements have ARIA labels', () => {
    renderTodoItem(mockTodo);

    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    expect(screen.getByLabelText('Mark todo as complete')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete todo')).toBeInTheDocument();
  });
});
