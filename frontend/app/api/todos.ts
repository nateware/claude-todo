/**
 * Todo API client
 * Provides typed functions for interacting with the todos API
 */

import { apiFetch } from './client';
import type { Todo } from '~/types/todo';

export const todoApi = {
  /**
   * Get all todos
   * @returns Array of all todos
   */
  getAll: () => apiFetch<Todo[]>('/api/todos'),

  /**
   * Create a new todo
   * @param text - Todo text
   * @returns Created todo with generated ID
   */
  create: (text: string) =>
    apiFetch<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  /**
   * Toggle todo completion status
   * @param id - Todo ID
   * @returns Updated todo
   */
  toggleComplete: (id: number) =>
    apiFetch<Todo>(`/api/todos/${id}/complete`, {
      method: 'PATCH',
    }),

  /**
   * Delete a todo
   * @param id - Todo ID
   * @returns void
   */
  delete: (id: number) =>
    apiFetch<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    }),
};
