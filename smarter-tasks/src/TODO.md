- [x] Implement `id`-based tasks (update `TaskItem`, `TaskForm`, `TaskList`, `Task`, `TaskApp`).
- [x] Persist tasks to localStorage via custom hook (`useLocalStorage`).
- [x] Load/populate tasks from localStorage on page reload.
- [x] Add delete button per task (`className="deleteTaskButton"`).
- [x] Ensure every task is rendered inside an `li`.
- [ ] Run ESLint and Prettier to satisfy formatting/style.

## App-level vs Component-level state (React)

### App-level state (use Context + optionally useReducer)
Use app-level state when:
- The data must be shared across multiple components/route levels.
- Multiple components need to react to the same state changes.
- The state affects global behavior (e.g., theming).
- The state must be persisted (e.g., theme, auth/session info).

In this codebase:
- `src/theme/ThemeContext.tsx` stores and persists the current theme.
- `src/pages/projects/ProjectsProvider.tsx` uses `useReducer` to keep projects + loading/error in a centralized place so both the list and modal can use the same data.

### Component-level state (useState)
Use component-level state when:
- The state is only relevant to one UI component.
- It controls local UI behavior (modal open/close, input draft, dropdown visibility).
- You need isolated/reusable component instances.

In this codebase:
- `src/pages/projects/NewProject.tsx` uses `useState` for `isOpen` (modal UI only), while it uses app-level context for the actual projects data.

### Combination is normal
You can (and should) combine both approaches:
- App-level state for shared/domain data.
- Component-level state for UI-only concerns around that domain data.




