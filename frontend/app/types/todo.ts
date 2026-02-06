export interface Todo {
  id: number;           // Autoincrementing integer from database
  text: string;         // Todo description
  completed: boolean;   // Completion status
  createdAt: number;    // Timestamp for sorting
  sortOrder: number;    // Position in list for drag-and-drop
}

export type TodoTab = 'active' | 'completed';
