# Claude Todo App

A full-stack todo application **completely written by Claude** to demonstrate "hands off the wheel" development with AI assistance. In fact, even this README was written by Claude.

## What is this?

This project showcases how Claude can build a complete, production-ready application from scratch with minimal human intervention. From initial planning to final testing, Claude handled:

- ✅ Architecture design and planning
- ✅ Frontend development (React + TypeScript)
- ✅ Backend API implementation (Node.js + Fastify)
- ✅ Database schema and migrations
- ✅ Comprehensive test coverage (120 tests)
- ✅ Documentation

## Features

### Core Functionality
- **Add todos** with a floating action button and dialog
- **Mark todos complete** - automatically moves to "Completed" tab
- **Delete todos** with confirmation dialog
- **Tab navigation** between Active and Completed todos
- **Drag and drop reordering** within each tab
- **Dark mode support** with system preference detection
- **Persistent storage** via SQLite database
- **Optimistic UI updates** with error rollback

### Technical Highlights
- **Type-safe** - Full TypeScript coverage
- **Tested** - 49 backend + 71 frontend tests (120 total)
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Responsive** - Mobile-friendly design
- **Modern stack** - React 19, React Router 8, Tailwind CSS 4

## How It Was Built

### Development Process

1. **Planning Phase**: Claude created a comprehensive implementation plan covering three phases:
   - Phase 1: Frontend UI components
   - Phase 2: SQLite database + REST API
   - Phase 3: Comprehensive testing

2. **Iterative Development**: Each phase was implemented systematically:
   - Bottom-up component building (smallest to largest)
   - API-first backend design
   - Test-driven development for quality assurance

3. **Quality Assurance**:
   - Database isolation for clean tests
   - Integration tests for user flows
   - Error handling and edge cases

The complete plan is available in [`plans/todo-app-implementation.md`](plans/todo-app-implementation.md).

## Project Structure

```
claude-todo/
├── backend/                    # Node.js + Fastify API
│   ├── db/
│   │   ├── database.js        # SQLite initialization
│   │   ├── migrations.js      # Database migrations
│   │   └── schema.sql         # Database schema
│   ├── plugins/
│   │   ├── cors.js           # CORS configuration
│   │   └── database.js       # Database plugin
│   ├── routes/
│   │   └── api/todos/
│   │       └── index.js      # CRUD endpoints
│   ├── test/
│   │   ├── setup.js          # Test utilities
│   │   └── routes/api/
│   │       └── todos.test.js # API tests (46 tests)
│   └── app.js                # Fastify app setup
│
├── frontend/                   # React + TypeScript
│   ├── app/
│   │   ├── api/
│   │   │   ├── client.ts     # API client wrapper
│   │   │   └── todos.ts      # Todo API methods
│   │   ├── components/todos/
│   │   │   ├── TodoApp.tsx          # Main container
│   │   │   ├── TodoList.tsx         # List with drag-drop
│   │   │   ├── TodoItem.tsx         # Individual item
│   │   │   ├── AddTodoDialog.tsx    # Add dialog
│   │   │   ├── ConfirmDialog.tsx    # Delete confirmation
│   │   │   ├── ErrorDialog.tsx      # Error display
│   │   │   ├── TabBar.tsx           # Tab switcher
│   │   │   └── AddButton.tsx        # FAB
│   │   ├── routes/
│   │   │   └── home.tsx      # Main route
│   │   └── types/
│   │       └── todo.ts       # TypeScript types
│   ├── test/
│   │   ├── setup.ts          # Test configuration
│   │   ├── mocks/            # MSW API mocks
│   │   └── ...               # Component tests (71 tests)
│   └── vitest.config.ts      # Vitest configuration
│
└── plans/
    └── todo-app-implementation.md  # Complete implementation plan
```

## Tech Stack

### Backend
- **Runtime**: Node.js 22.22.2+ or 24.15+
- **Framework**: Fastify 5.12
- **Database**: SQLite with better-sqlite3
- **Testing**: Node.js native test runner

### Frontend
- **Framework**: React 19.3
- **Router**: React Router 8.4
- **Language**: TypeScript 7.0
- **Styling**: Tailwind CSS 4.3
- **Drag & Drop**: @dnd-kit
- **Testing**: Vitest + React Testing Library + MSW

## Getting Started

### Quick start on a new Mac (no coding experience needed)

1. **Download the code.** On this project's GitHub page, click the green **Code** button, then **Download ZIP**. Open your Downloads folder and double-click the ZIP to unzip it.
2. **Open Terminal.** Press Cmd+Space, type `Terminal`, and press Return.
3. **Go to the project folder.** Type this and press Return:
   ```bash
   cd ~/Downloads/claude-todo-main
   ```
4. **Run setup (one time only).** This installs Homebrew and Node.js, which takes 10-15 minutes. When it asks for a password, type your Mac login password. Nothing appears on screen as you type; that is normal.
   ```bash
   bash setup.sh
   ```
5. **Start the app:**
   ```bash
   npm run dev
   ```
   Then open http://localhost:5173 in your browser. Press Ctrl+C in Terminal to stop.

Your Mac account must be an administrator to install Homebrew.

### Prerequisites
- Node.js 22.22.2+ or 24.15+ (Node 23 and 25 are not supported by the test tooling)
- npm 10.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd claude-todo
   ```

2. **Install all dependencies** (root, backend and frontend)
   ```bash
   npm install
   ```

### Running the Application

```bash
npm run dev
```

This starts both servers in one terminal (Ctrl+C stops both):
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

No database setup is needed. The backend uses SQLite and creates `backend/data/todos.db` on first start. Delete that file to reset to an empty list.

### Running Tests

**Backend tests** (49 tests)
```bash
cd backend
npm test
```

**Frontend tests** (71 tests)
```bash
cd frontend
npm test          # Watch mode
npm run test:run  # Single run
```

## API Documentation

### Endpoints

- `GET /api/todos` - Retrieve all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id/complete` - Toggle completion status
- `PATCH /api/todos/:id/reorder` - Reorder todo within its list
- `DELETE /api/todos/:id` - Delete a todo

See [`plans/todo-app-implementation.md`](plans/todo-app-implementation.md) for detailed API documentation.

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

## Testing Strategy

### Backend (Node.js native test)
- In-memory SQLite databases for test isolation
- Comprehensive endpoint testing with validation
- Transaction atomicity testing

### Frontend (Vitest)
- API client unit tests
- Component tests with user interactions
- Integration tests for complete user flows
- MSW for network-level API mocking
- Dialog polyfills for jsdom compatibility

## Key Design Decisions

1. **Native HTML Dialog Elements**: Uses `<dialog>` for modals (modern, accessible)
2. **Optimistic Updates**: UI updates immediately, rolls back on error
3. **Database-Generated IDs**: Backend controls ID generation for data integrity
4. **Drag and Drop**: @dnd-kit for smooth, accessible reordering
5. **Test Isolation**: Every test gets its own database instance

## Lessons Learned

This project demonstrates several AI-assisted development patterns:

- **Comprehensive Planning**: Starting with a detailed plan enables autonomous implementation
- **Iterative Development**: Building in phases allows for validation at each stage
- **Test-First Mindset**: Tests catch issues early and document expected behavior
- **Type Safety**: TypeScript catches errors before runtime
- **Component Isolation**: Small, focused components are easier to test and maintain

## Contributing

This project was built as a demonstration. While it's fully functional, it's primarily intended as an educational example of AI-assisted development.

## License

MIT License - See LICENSE file for details

---

**Built entirely by Claude** - An AI assistant by Anthropic
