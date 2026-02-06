import { useState, useEffect } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Todo, TodoTab } from "~/types/todo";
import { TodoList } from "./TodoList";
import { TabBar } from "./TabBar";
import { AddButton } from "./AddButton";
import { AddTodoDialog } from "./AddTodoDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorDialog } from "./ErrorDialog";
import { todoApi } from "~/api/todos";
import { ApiError } from "~/api/client";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTab, setCurrentTab] = useState<TodoTab>("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Load todos on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const fetchedTodos = await todoApi.getAll();
        setTodos(fetchedTodos);
      } catch (error) {
        const message = error instanceof ApiError
          ? error.message
          : "Failed to load todos";
        setErrorMessage(message);
        setIsErrorDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Business logic functions with API integration
  const addTodo = async (text: string) => {
    try {
      const newTodo = await todoApi.create(text);
      setTodos((prev) => [newTodo, ...prev]);
      closeAddDialog();
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "Failed to create todo";
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  };

  const toggleTodo = async (id: number) => {
    const previousTodos = todos;

    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    try {
      await todoApi.toggleComplete(id);
    } catch (error) {
      // Rollback on error
      setTodos(previousTodos);
      const message = error instanceof ApiError
        ? error.message
        : "Failed to update todo";
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  };

  const deleteTodo = async (id: number) => {
    const previousTodos = todos;

    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setDeleteConfirmId(null);

    try {
      await todoApi.delete(id);
    } catch (error) {
      // Rollback on error
      setTodos(previousTodos);
      const message = error instanceof ApiError
        ? error.message
        : "Failed to delete todo";
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  };

  const reorderTodo = async (id: number, fromIndex: number, toIndex: number) => {
    const previousTodos = todos;

    // Optimistic update - reorder in local state
    const reorderedTodos = [...displayedTodos];
    const [movedTodo] = reorderedTodos.splice(fromIndex, 1);
    reorderedTodos.splice(toIndex, 0, movedTodo);

    // Update full todos array with reordered items
    setTodos((prev) => {
      const otherTabTodos = prev.filter(
        (todo) => todo.completed !== (currentTab === "active" ? false : true)
      );
      return [...reorderedTodos, ...otherTabTodos];
    });

    try {
      await todoApi.reorder(id, fromIndex, toIndex);
    } catch (error) {
      // Rollback on error
      setTodos(previousTodos);
      const message = error instanceof ApiError
        ? error.message
        : "Failed to reorder todo";
      setErrorMessage(message);
      setIsErrorDialogOpen(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = displayedTodos.findIndex((todo) => todo.id === active.id);
    const newIndex = displayedTodos.findIndex((todo) => todo.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderTodo(active.id as number, oldIndex, newIndex);
    }
  };

  // Dialog control functions
  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => setIsAddDialogOpen(false);

  const handleAddTodo = (text: string) => {
    addTodo(text);
  };

  const openDeleteConfirm = (id: number) => setDeleteConfirmId(id);
  const closeDeleteConfirm = () => setDeleteConfirmId(null);
  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      deleteTodo(deleteConfirmId);
    }
  };

  const closeErrorDialog = () => {
    setIsErrorDialogOpen(false);
    setErrorMessage(null);
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

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <TodoList
            todos={displayedTodos}
            onToggle={toggleTodo}
            onDelete={openDeleteConfirm}
            onDragEnd={handleDragEnd}
          />
        )}

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

        <ErrorDialog
          isOpen={isErrorDialogOpen}
          message={errorMessage || "An error occurred"}
          onClose={closeErrorDialog}
        />
      </div>
    </div>
  );
}
