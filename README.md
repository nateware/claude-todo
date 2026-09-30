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
│   │   ├── components/todos/     # Tests sit beside each file (*.test.tsx)
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
│   │   └── mocks/            # MSW API mocks
│   └── vitest.config.ts      # Vitest configuration
│
├── plans/
│   └── todo-app-implementation.md  # Complete implementation plan
├── install.sh                 # Downloads the project, then runs setup.sh
├── package.json               # Root scripts: npm run dev, npm test
└── setup.sh                   # One-time setup: Node.js and app packages
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

### New Mac (no coding experience needed)

No administrator rights or developer tools are needed.

1. **Open Terminal.** Press Cmd+Space, type `Terminal`, and press Return.
2. **Paste this line into Terminal and press Return:**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/nateware/claude-todo/main/install.sh | bash
   ```
   When it asks where to put the project, press Return to use `~/claude-todo`. Setup takes a few minutes.
3. **Start the app.** Open a new Terminal window (Cmd+N) and run:
   ```bash
   cd ~/claude-todo
   npm run dev
   ```
   Open http://localhost:5173 in your browser. To stop the app, click in Terminal and press Control+C.

Next time, open Terminal and run the two commands in step 3.

### Engineers

```bash
git clone https://github.com/nateware/claude-todo.git
cd claude-todo
./setup.sh
```

### What setup.sh does

It installs Node.js only if you don't already have a new enough version (22.22.2+, 24.15+, or 26+), then installs the app's packages. It never uses sudo.

- **Homebrew installed** (typical for engineers): installs or upgrades Node.js with Homebrew.
- **No Homebrew:** downloads Node.js 24 from nodejs.org into `~/.local/node`.

Either way it adds one line to `~/.zshrc` so new Terminal windows can find Node.js. It is safe to run again.

To skip it, install a supported Node.js yourself and run `npm install` in the project folder.

`npm run dev` starts both servers in one terminal:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Database

No database setup is needed. The backend uses SQLite, which is included in its packages, and creates `backend/data/todos.db` on first start. Delete that file to reset to an empty list.

### Running Tests

From the project folder:

```bash
npm test
```

This runs the backend tests (49) and then the frontend tests (71). To re-run frontend tests as you edit files, run `npm test` inside `frontend/`.

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
