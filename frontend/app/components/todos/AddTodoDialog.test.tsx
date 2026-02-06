import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AddTodoDialog } from './AddTodoDialog';

describe('AddTodoDialog', () => {
  test('renders dialog when open', () => {
    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('submit calls onAdd with trimmed text', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={onAdd}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '  Buy groceries  ');

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    expect(onAdd).toHaveBeenCalledWith('Buy groceries');
  });

  test('cannot submit empty text', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={onAdd}
      />
    );

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    expect(onAdd).not.toHaveBeenCalled();
  });

  test('cannot submit whitespace-only text', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={onAdd}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '   ');

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    expect(onAdd).not.toHaveBeenCalled();
  });

  test('cancel button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={onClose}
        onAdd={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  test('cancel clears input', async () => {
    const user = userEvent.setup();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'Some text');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Input should be cleared after cancel
    expect(input.value).toBe('');
  });

  test('Enter key submits form', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <AddTodoDialog
        isOpen={true}
        onClose={vi.fn()}
        onAdd={onAdd}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'New todo{Enter}');

    expect(onAdd).toHaveBeenCalledWith('New todo');
  });
});
