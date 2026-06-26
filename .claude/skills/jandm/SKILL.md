```markdown
# jandm Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `jandm` TypeScript codebase. It covers file organization, import/export styles, commit message practices, and testing patterns. By following these guidelines, contributors can maintain consistency and quality across the project.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names.
  - Example: `MyComponent.ts`, `UserService.ts`

### Import Style
- **Relative imports** are used to reference modules within the project.
  - Example:
    ```typescript
    import { UserService } from './UserService';
    ```

### Export Style
- **Named exports** are preferred.
  - Example:
    ```typescript
    // UserService.ts
    export function getUser(id: string) { ... }
    export const USER_ROLE = 'admin';
    ```

### Commit Messages
- **Freeform** commit messages, sometimes with prefixes.
- Average length: ~48 characters.
  - Example:
    ```
    Add user authentication logic
    Fix bug in UserService export
    ```

## Workflows

### Adding a New Module
**Trigger:** When you need to introduce a new feature or utility.
**Command:** `/add-module`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Use relative imports for dependencies.
3. Export functions, classes, or constants using named exports.
4. Add corresponding tests in a `NewFeature.test.ts` file.

### Refactoring Code
**Trigger:** When improving or reorganizing existing code.
**Command:** `/refactor`

1. Identify the code to refactor.
2. Rename files to PascalCase if needed.
3. Update import paths to maintain relative imports.
4. Ensure all exports are named.
5. Run tests to verify changes.

### Writing Tests
**Trigger:** When adding or updating code.
**Command:** `/write-test`

1. Create a test file with the pattern `*.test.ts` (e.g., `UserService.test.ts`).
2. Write tests for all exported functions and classes.
3. Use the project's preferred (unknown) testing framework.
4. Run tests and ensure they pass.

## Testing Patterns

- **Test File Naming:** Test files use the pattern `*.test.ts`.
  - Example: `UserService.test.ts`
- **Framework:** Not specified; use standard TypeScript testing practices.
- **Coverage:** Test all named exports in the corresponding module.

## Commands
| Command        | Purpose                                    |
|----------------|--------------------------------------------|
| /add-module    | Scaffold a new module with tests           |
| /refactor      | Refactor code following project conventions |
| /write-test    | Create or update a test file               |
```
