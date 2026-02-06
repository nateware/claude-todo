interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add new todo"
      className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-3xl font-light leading-none"
    >
      <span className="block -mt-1">+</span>
    </button>
  );
}
