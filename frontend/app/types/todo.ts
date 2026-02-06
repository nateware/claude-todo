export interface Todo {
  id: string;           // Generated UUID using crypto.randomUUID()
  text: string;         // Todo description
  completed: boolean;   // Completion status
  createdAt: number;    // Timestamp for sorting
}

export type TodoTab = 'active' | 'completed';
