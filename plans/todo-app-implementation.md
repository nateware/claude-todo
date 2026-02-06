# Todo App Implementation Plan

## Overview
Create a todo application with active/completed tabs, add/delete dialogs, and in-memory state management using React Router 7, TypeScript, and Tailwind CSS.

## Requirements Summary
- Main page with list of todo items
- "+" button to add new todo with dialog popup
- Each todo has checkmark (mark done) and "X" (delete) buttons
- "X" shows confirmation dialog before deletion
- Checkmark moves item to "Completed" tab
- In-memory state (no backend database)

## Tech Stack
- React 19.2.4
- React Router 7.12.0 (file-based routing)
- TypeScript 5.9.2
- Tailwind CSS 4.1.13 (dark mode enabled)
- Native HTML `<dialog>` elements for modals

## File Structure

### New Files to Create
```
frontend/app/
├── types/
│   └── todo.ts                          # TypeScript interfaces
├── components/
│   └── todos/
│       ├── TodoApp.tsx                  # Main container with state
│       ├── TodoList.tsx                 # List container
│       ├── TodoItem.tsx                 # Individual todo item
│       ├── AddTodoDialog.tsx            # Add todo dialog
│       ├── ConfirmDialog.tsx            # Delete confirmation dialog
│       ├── TabBar.tsx                   # Active/Completed tabs
│       └── AddButton.tsx                # "+" floating action button
```

### Files to Modify
- `/Users/natewiger/Workspace/claude-todo/frontend/app/routes/home.tsx` - Replace Welcome with TodoApp
- `/Users/natewiger/Workspace/claude-todo/frontend/app/app.css` - Add dialog backdrop styling

## TypeScript Interfaces

### `todo.ts`
```typescript
export interface Todo {
  id: number;           // Autoincrementing integer from database
  text: string;         // Todo description
  completed: boolean;   // Completion status
  createdAt: number;    // Timestamp for sorting
}

export type TodoTab = 'active' | 'completed';
```

**Note:** Frontend type will be updated from `id: string` to `id: number`

## Component Architecture

### 1. TodoApp.tsx (Main Container)
**Responsibilities:**
- All state management using React useState hooks
- Business logic for add/toggle/delete operations
- Coordinates all child components

**State:**
```typescript
const [todos, setTodos] = useState<Todo[]>([]);
const [currentTab, setCurrentTab] = useState<TodoTab>('active');
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
```

**Key Functions:**
- `addTodo(text: string)` - Creates new todo, adds to array
- `toggleTodo(id: string)` - Toggles completed status
- `deleteTodo(id: string)` - Removes todo from array
- `openAddDialog()`, `closeAddDialog()` - Controls add dialog
- `openDeleteConfirm(id)`, `closeDeleteConfirm()` - Controls delete dialog

**Derived State:**
- `activeTodos` - Filter todos where completed=false
- `completedTodos` - Filter todos where completed=true
- `displayedTodos` - Based on currentTab

### 2. TodoList.tsx (Presentation)
**Props:** `todos`, `onToggle`, `onDelete`
- Maps over todos array
- Renders TodoItem for each
- Shows empty state message when no todos

### 3. TodoItem.tsx (Individual Item)
**Props:** `todo`, `onToggle`, `onDelete`
- Displays todo text
- Checkmark button (circle with check icon)
- Delete button (X icon)
- Tailwind styling with hover states and dark mode

### 4. AddTodoDialog.tsx (Native Dialog)
**Props:** `isOpen`, `onClose`, `onAdd`
- Uses `<dialog>` element with ref
- `.showModal()` when isOpen=true
- Text input with local state
- OK/Cancel buttons
- Validates non-empty text before calling onAdd

### 5. ConfirmDialog.tsx (Reusable Confirmation)
**Props:** `isOpen`, `message`, `onConfirm`, `onCancel`
- Generic confirmation dialog
- Uses native `<dialog>` element
- Displays custom message
- Confirm/Cancel buttons

### 6. TabBar.tsx (Tab Switcher)
**Props:** `currentTab`, `onTabChange`, `activeTodosCount`, `completedTodosCount`
- Two buttons: "Active" and "Completed"
- Shows counts in labels (e.g., "Active (3)")
- Active tab has border-b and color styling

### 7. AddButton.tsx (FAB)
**Props:** `onClick`
- Fixed position bottom-right
- Circular button with "+" icon
- Blue background with hover effects

## Implementation Steps

### Phase 1: Foundation (COMPLETED)
1. ✅ Create `types/todo.ts` with Todo interface and TodoTab type
   - **Note:** Will be updated in Phase 2 to change `id: string` to `id: number`

### Phase 2: Core Components (Bottom-Up)
2. Build `TodoItem.tsx` - smallest unit with checkmark/delete buttons
3. Build `TodoList.tsx` - maps TodoItem components, handles empty state
4. Build `TabBar.tsx` - tab switching UI with active state

### Phase 3: Dialogs
5. Build `AddTodoDialog.tsx` - native dialog with input and validation
6. Build `ConfirmDialog.tsx` - reusable confirmation dialog

### Phase 4: Actions
7. Build `AddButton.tsx` - floating action button

### Phase 5: Container
8. Build `TodoApp.tsx` - main component with all state and logic

### Phase 6: Integration
9. Update `routes/home.tsx` - import and render TodoApp instead of Welcome
10. Update `app.css` - add dialog backdrop styling

## Tailwind Styling Patterns

**Follow existing dark mode patterns:**
- Use `dark:` prefix for all dark mode variants
- Backgrounds: `bg-white dark:bg-gray-950`
- Text: `text-gray-700 dark:text-gray-200`
- Borders: `border-gray-200 dark:border-gray-700`

**Key Patterns:**

**TodoApp Container:**
```tsx
className="min-h-screen bg-white dark:bg-gray-950"
className="max-w-2xl mx-auto p-4 pt-16"
```

**TodoItem:**
```tsx
className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
```

**AddButton (FAB):**
```tsx
className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
```

**Dialog (in app.css):**
```css
dialog::backdrop {
  @apply bg-black/50;
}
```

## Key Implementation Details

**~~ID Generation:~~** (Removed - now handled by database)
```typescript
// REMOVED: const generateId = () => crypto.randomUUID();
// Database now generates autoincrementing integer IDs
```

**Add Todo:** (Updated for Phase 2 - will call API)
```typescript
// Phase 1 version (local only):
const addTodo = (text: string) => {
  const newTodo: Todo = {
    id: generateId(), // Will be removed
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  setTodos(prev => [...prev, newTodo]);
};

// Phase 2 version (with API):
const addTodo = async (text: string) => {
  try {
    const newTodo = await todoApi.create(text); // Receives ID from server
    setTodos(prev => [...prev, newTodo]);
    closeAddDialog();
  } catch (error) {
    setErrorMessage(error.message);
    setIsErrorDialogOpen(true);
  }
};
```

**Toggle Todo:** (Updated for Phase 2 - will call API)
```typescript
// Phase 1 version (local only):
const toggleTodo = (id: number) => {
  setTodos(prev =>
    prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
};

// Phase 2 version (with API and optimistic update):
const toggleTodo = async (id: number) => {
  const previousTodos = todos;
  setTodos(prev => prev.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
  try {
    await todoApi.toggleComplete(id);
  } catch (error) {
    setTodos(previousTodos);
    setErrorMessage(error.message);
    setIsErrorDialogOpen(true);
  }
};
```

**Delete Todo:** (Updated for Phase 2 - will call API)
```typescript
// Phase 1 version (local only):
const deleteTodo = (id: number) => {
  setTodos(prev => prev.filter(todo => todo.id !== id));
  setDeleteConfirmId(null);
};

// Phase 2 version (with API and optimistic update):
const deleteTodo = async (id: number) => {
  const previousTodos = todos;
  setTodos(prev => prev.filter(todo => todo.id !== id));
  setDeleteConfirmId(null);
  try {
    await todoApi.delete(id);
  } catch (error) {
    setTodos(previousTodos);
    setErrorMessage(error.message);
    setIsErrorDialogOpen(true);
  }
};
```

**Dialog Control with useEffect:**
```typescript
const dialogRef = useRef<HTMLDialogElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.showModal();
  } else {
    dialogRef.current?.close();
  }
}, [isOpen]);
```

## Critical Files Reference

1. **`/Users/natewiger/Workspace/claude-todo/frontend/app/types/todo.ts`** - Core type definitions
2. **`/Users/natewiger/Workspace/claude-todo/frontend/app/components/todos/TodoApp.tsx`** - Main orchestrator
3. **`/Users/natewiger/Workspace/claude-todo/frontend/app/components/todos/TodoItem.tsx`** - Core UI pattern
4. **`/Users/natewiger/Workspace/claude-todo/frontend/app/routes/home.tsx`** - Integration point
5. **`/Users/natewiger/Workspace/claude-todo/frontend/app/app.css`** - Dialog styling

## Verification & Testing

### Manual Testing Checklist
1. ✓ Add todo with valid text
2. ✓ Try to add empty todo (should be prevented)
3. ✓ Mark todo as complete (moves to Completed tab)
4. ✓ Delete todo (shows confirmation dialog)
5. ✓ Cancel delete (todo remains)
6. ✓ Switch between Active and Completed tabs
7. ✓ Test dark mode appearance
8. ✓ Test with multiple todos (5-10 items)
9. ✓ Test empty states (no active/completed todos)
10. ✓ Keyboard navigation (ESC closes dialogs, Enter submits)

### How to Test
```bash
cd /Users/natewiger/Workspace/claude-todo/frontend
npm run dev
```

Open browser to the development URL and verify:
- "+" button opens dialog
- OK button adds todo to active list
- Cancel button closes dialog without adding
- Checkmark moves todo to Completed tab
- X button shows confirmation
- Confirming deletion removes todo
- Tab switching shows correct filtered lists
- Dark mode toggle works correctly

## Future Enhancements (Not in Scope)
- localStorage persistence
- Edit todo text inline
- ~~Backend API integration~~ **NOW IN SCOPE - SEE BELOW**
- Drag and drop reordering
- Due dates and priorities

---

# Phase 2: SQLite Database Backend and REST API

## Overview
Add SQLite database persistence and REST API to the todo app. Backend will generate IDs and store todos in database. Frontend will call API endpoints instead of managing local state.

## Requirements
- SQLite database in backend/ directory
- REST API endpoints for CRUD operations
- Backend generates todo IDs (not frontend)
- Frontend uses optimistic updates with rollback on error
- Error dialog shows on API failures without changing UI
- Initial data load from database on mount

## Tech Stack Additions
**Backend:**
- SQLite database with better-sqlite3 driver
- Fastify 5.0.0 (already installed)
- @fastify/cors for cross-origin requests

**Frontend:**
- Native fetch API for HTTP requests
- New API client layer in app/api/

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing ID from database
  text TEXT NOT NULL,                     -- Todo description
  completed INTEGER NOT NULL DEFAULT 0,   -- SQLite boolean (0/1)
  created_at INTEGER NOT NULL             -- Unix timestamp (ms)
);

CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);
```

**Database Location:** `backend/data/todos.db` (gitignored)
**ID Strategy:** Database generates autoincrementing integers on INSERT

## REST API Endpoints

### POST /api/todos
Create new todo (database generates autoincrementing ID)

**Request:**
```json
{
  "text": "Buy groceries"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "text": "Buy groceries",
  "completed": false,
  "createdAt": 1709654321000
}
```

**Validation:** text required, 1-500 chars, trim whitespace

---

### GET /api/todos
Retrieve all todos

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "text": "Buy groceries",
    "completed": false,
    "createdAt": 1709654321000
  },
  {
    "id": 2,
    "text": "Walk the dog",
    "completed": true,
    "createdAt": 1709654322000
  }
]
```

---

### PATCH /api/todos/:id/complete
Toggle todo completion status

**URL Parameter:** `id` - Integer todo ID

**Response (200 OK):**
```json
{
  "id": 1,
  "text": "Buy groceries",
  "completed": true,
  "createdAt": 1709654321000
}
```

**Errors:** 404 if todo not found, 400 if invalid integer ID

---

### DELETE /api/todos/:id
Delete todo

**URL Parameter:** `id` - Integer todo ID

**Response (204 No Content):** Empty body

**Errors:** 404 if todo not found, 400 if invalid integer ID

---

## Error Response Format

All errors use standard format:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Todo text is required and must be 1-500 characters"
}
```

## Success Criteria

✅ All existing frontend functionality works
✅ Todos persist across page refreshes
✅ Database generates autoincrementing integer IDs (frontend doesn't)
✅ Frontend type changed from `id: string` to `id: number`
✅ API errors show error dialog
✅ UI updates optimistically (no lag)
✅ Error dialog doesn't change UI state
✅ All tests pass
✅ Works in both light and dark mode

---

# Phase 3: Comprehensive Testing Implementation

## Overview
Add comprehensive test coverage for both backend and frontend without modifying any working code. Backend uses Node.js native test infrastructure. Frontend uses Vitest + React Testing Library.

## Testing Strategy Summary

**Backend (Node.js native test):**
- 46 test cases covering all 5 API endpoints ✅
- Database isolation per test (in-memory SQLite) ✅
- Comprehensive validation and error testing ✅

**Frontend (Vitest + React Testing Library):**
- 71 test cases covering all components ✅
- Unit tests for API client layer (20 tests) ✅
- Component tests with user interactions (51 tests) ✅
- Integration tests for full user flows ✅
- API mocking with MSW (Mock Service Worker) ✅

## Test Results

### Backend: ✅ 46 tests passing
- POST /api/todos (12 tests)
- GET /api/todos (6 tests)
- PATCH /api/todos/:id/complete (9 tests)
- DELETE /api/todos/:id (7 tests)
- PATCH /api/todos/:id/reorder (12 tests)

### Frontend: ✅ 71 tests passing
- API client tests (20 tests)
- Component tests (51 tests):
  - AddButton (3 tests)
  - TabBar (5 tests)
  - ConfirmDialog (4 tests)
  - ErrorDialog (3 tests)
  - AddTodoDialog (7 tests)
  - TodoItem (8 tests)
  - TodoList (5 tests)
  - TodoApp integration (16 tests)

## Key Testing Achievements

1. **Database Isolation**: Created in-memory SQLite databases per test to prevent pollution
2. **Dialog Polyfill**: Added HTMLDialogElement.prototype.showModal/close for jsdom compatibility
3. **API Mocking**: Implemented MSW for realistic network-level API mocking
4. **Optimistic Updates**: Tested rollback scenarios when API calls fail
5. **User Flows**: Comprehensive integration tests covering all major user journeys

## Running Tests

### Backend
```bash
cd backend && npm test
```

### Frontend
```bash
cd frontend && npm test          # watch mode
cd frontend && npm run test:run  # single run
cd frontend && npm run test:coverage  # with coverage
```

## Success Criteria

✅ Backend: 46 tests covering all endpoints and edge cases
✅ Frontend: 71 tests covering components and flows
✅ No changes to working code (only new test files)
✅ Database isolation prevents test pollution
✅ All tests pass in CI/CD
✅ Clear patterns for future test additions
✅ **Total: 117 tests passing**
