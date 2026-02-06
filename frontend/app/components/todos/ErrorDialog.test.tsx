import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ErrorDialog } from './ErrorDialog';

describe('ErrorDialog', () => {
  test('shows error message when open', () => {
    render(
      <ErrorDialog
        isOpen={true}
        message="Network error occurred"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  test('OK button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ErrorDialog
        isOpen={true}
        message="Error"
        onClose={onClose}
      />
    );

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  test('displays custom error message', () => {
    render(
      <ErrorDialog
        isOpen={true}
        message="Failed to connect to server"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
  });
});
