import { useEffect, useRef } from "react";

interface ErrorDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({
  isOpen,
  title = "Error",
  message,
  onClose,
}: ErrorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop:bg-black/50 min-w-[20rem]"
    >
      <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
        {title}
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </dialog>
  );
}
