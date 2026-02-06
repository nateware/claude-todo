import { useState } from "react";
import type { Todo, TodoTab } from "~/types/todo";
import { TodoList } from "./TodoList";
import { TabBar } from "./TabBar";
import { AddButton } from "./AddButton";
import { AddTodoDialog } from "./AddTodoDialog";
import { ConfirmDialog } from "./ConfirmDialog";

// Generate UUID using Web Crypto API
const generateId = () => crypto.randomUUID();

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTab, setCurrentTab] = useState<TodoTab>("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Business logic functions
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setDeleteConfirmId(null);
  };

  // Dialog control functions
  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => setIsAddDialogOpen(false);

  const handleAddTodo = (text: string) => {
    addTodo(text);
    closeAddDialog();
  };

  const openDeleteConfirm = (id: string) => setDeleteConfirmId(id);
  const closeDeleteConfirm = () => setDeleteConfirmId(null);
  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteTodo(deleteConfirmId);
    }
  };

  // Derived state
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const displayedTodos = currentTab === "active" ? activeTodos : completedTodos;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-2xl mx-auto p-4 pt-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Todo List
        </h1>

        <TabBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          activeTodosCount={activeTodos.length}
          completedTodosCount={completedTodos.length}
        />

        <TodoList
          todos={displayedTodos}
          onToggle={toggleTodo}
          onDelete={openDeleteConfirm}
        />

        <AddButton onClick={openAddDialog} />

        <AddTodoDialog
          isOpen={isAddDialogOpen}
          onClose={closeAddDialog}
          onAdd={handleAddTodo}
        />

        <ConfirmDialog
          isOpen={deleteConfirmId !== null}
          message="Are you sure?"
          onConfirm={confirmDelete}
          onCancel={closeDeleteConfirm}
        />
      </div>
    </div>
  );
}
