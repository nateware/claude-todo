import { useEffect, useRef, useState } from "react";

interface AddTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export function AddTodoDialog({ isOpen, onClose, onAdd }: AddTodoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      inputRef.current?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (trimmedText) {
      onAdd(trimmedText);
      setText("");
    }
  };

  const handleCancel = () => {
    setText("");
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop:bg-black/50 min-w-[20rem]"
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Add New Todo
        </h2>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter todo text..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 mb-6"
        />

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            OK
          </button>
        </div>
      </form>
    </dialog>
  );
}
