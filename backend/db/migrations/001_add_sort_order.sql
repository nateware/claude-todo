-- Migration: Add sort_order column for drag-and-drop functionality
-- This migration adds sort_order column and backfills existing todos

-- Add sort_order column (nullable initially for migration)
ALTER TABLE todos ADD COLUMN sort_order INTEGER;

-- Backfill existing records: assign sort_order based on created_at DESC
-- Active todos (completed=0) get their own sequence starting from 0
-- Completed todos (completed=1) get their own sequence starting from 0
UPDATE todos SET sort_order = (
  SELECT COUNT(*)
  FROM todos t2
  WHERE t2.completed = todos.completed
    AND t2.created_at > todos.created_at
)
WHERE sort_order IS NULL;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_todos_completed_sort_order ON todos(completed, sort_order);

-- Drop old created_at index (now redundant)
DROP INDEX IF EXISTS idx_todos_created_at;
