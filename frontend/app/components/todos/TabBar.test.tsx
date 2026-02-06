import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TabBar } from './TabBar';

describe('TabBar', () => {
  test('shows both tabs', () => {
    render(
      <TabBar
        currentTab="active"
        onTabChange={vi.fn()}
        activeTodosCount={3}
        completedTodosCount={2}
      />
    );

    expect(screen.getByText(/Active/)).toBeInTheDocument();
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
  });

  test('displays counts for each tab', () => {
    render(
      <TabBar
        currentTab="active"
        onTabChange={vi.fn()}
        activeTodosCount={5}
        completedTodosCount={3}
      />
    );

    expect(screen.getByText(/Active \(5\)/)).toBeInTheDocument();
    expect(screen.getByText(/Completed \(3\)/)).toBeInTheDocument();
  });

  test('active tab has distinct styling', () => {
    const { rerender } = render(
      <TabBar
        currentTab="active"
        onTabChange={vi.fn()}
        activeTodosCount={2}
        completedTodosCount={1}
      />
    );

    const activeButton = screen.getByText(/Active/);
    expect(activeButton.className).toContain('border-blue-600');

    // Switch to completed tab
    rerender(
      <TabBar
        currentTab="completed"
        onTabChange={vi.fn()}
        activeTodosCount={2}
        completedTodosCount={1}
      />
    );

    const completedButton = screen.getByText(/Completed/);
    expect(completedButton.className).toContain('border-blue-600');
  });

  test('clicking tab calls onTabChange with correct value', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(
      <TabBar
        currentTab="active"
        onTabChange={onTabChange}
        activeTodosCount={2}
        completedTodosCount={1}
      />
    );

    const completedButton = screen.getByText(/Completed/);
    await user.click(completedButton);

    expect(onTabChange).toHaveBeenCalledWith('completed');
  });

  test('displays zero counts correctly', () => {
    render(
      <TabBar
        currentTab="active"
        onTabChange={vi.fn()}
        activeTodosCount={0}
        completedTodosCount={0}
      />
    );

    expect(screen.getByText(/Active \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Completed \(0\)/)).toBeInTheDocument();
  });
});
