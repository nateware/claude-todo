import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AddButton } from './AddButton';

describe('AddButton', () => {
  test('renders FAB button', () => {
    render(<AddButton onClick={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('clicking calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<AddButton onClick={onClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  test('has accessible label', () => {
    render(<AddButton onClick={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Add new todo');
  });
});
