import type { TodoTab } from "~/types/todo";

interface TabBarProps {
  currentTab: TodoTab;
  onTabChange: (tab: TodoTab) => void;
  activeTodosCount: number;
  completedTodosCount: number;
}

export function TabBar({
  currentTab,
  onTabChange,
  activeTodosCount,
  completedTodosCount,
}: TabBarProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        onClick={() => onTabChange("active")}
        className={`px-4 py-2 border-b-2 font-medium transition-colors ${
          currentTab === "active"
            ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        Active ({activeTodosCount})
      </button>
      <button
        onClick={() => onTabChange("completed")}
        className={`px-4 py-2 border-b-2 font-medium transition-colors ${
          currentTab === "completed"
            ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        Completed ({completedTodosCount})
      </button>
    </div>
  );
}
