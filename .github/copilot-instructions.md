# Copilot Instructions for Yotei Project

## Project Overview

**Yotei** is a modern scheduler/calendar application built with a monorepo architecture using pnpm workspaces. The project consists of a Remix frontend and a Hono backend API deployed on Cloudflare Workers.

## Technology Stack

### Frontend (apps/web)

- **Framework**: Remix (React-based SPA)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Calendar UI**: FullCalendar library
- **State Management**: TanStack Query (React Query)
- **Forms**: Conform + Zod validation
- **UI Components**: React Aria Components
- **Date Handling**: dayjs

### Backend (apps/api)

- **Framework**: Hono (Web Framework)
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Jose (JWT)
- **Error Handling**: neverthrow (functional error handling)
- **Validation**: Zod schemas
- **Recurring Events**: RRule specification

### Development Tools

- **Package Manager**: pnpm (>=10.0.0)
- **Linting**: ESLint with shared configs
- **Formatting**: Prettier
- **Testing**: Vitest
- **Database Migrations**: Drizzle Kit

## Project Structure

```
yotei/
├── apps/
│   ├── api/                 # Backend API (Hono + Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── auth/    # Authentication
│   │   │   │   ├── calendar/# Calendar management
│   │   │   │   ├── event/   # Event management
│   │   │   │   └── user/    # User management
│   │   │   └── db/          # Database configuration & schemas
│   │   └── drizzle/         # Migration files
│   │
│   └── web/                 # Frontend (Remix SPA)
│       ├── app/
│       │   ├── routes/      # File-based routing
│       │   ├── components/  # UI components
│       │   ├── api/         # API client layer
│       │   ├── models/      # Data models
│       │   └── hooks/       # Custom React hooks
│       └── public/          # Static assets
│
└── packages/
    └── eslint-config/       # Shared ESLint configuration
```

## Architecture Patterns

### Backend Architecture

- **Domain-Driven Design**: Features organized by domain modules
- **Workflow Pattern**: Business logic encapsulated in workflows
- **Repository Pattern**: Data access layer abstraction
- **Functional Error Handling**: Using neverthrow for Result types
- **Clean Architecture**: Clear separation of concerns

### Frontend Architecture

- **Component-Based**: Reusable UI components
- **File-Based Routing**: Remix routing conventions
- **API Client Layer**: Centralized API communication
- **Query Management**: TanStack Query for server state
- **Type Safety**: End-to-end TypeScript

## Key Features

### Calendar Management

- Create, edit, and delete calendars
- Multi-calendar support
- Permission-based access control

### Event Management

- Single and recurring events
- All-day event support
- RRule-based recurrence patterns
- Exception handling for recurring events
- Event editing with pattern selection (this/future/all)

### Calendar Views

- Monthly and weekly views
- FullCalendar integration
- Real-time loading indicators
- Date navigation

### Authentication

- JWT-based authentication
- Calendar-specific permissions
- Secure API endpoints

## Development Guidelines

### Code Style

- Use TypeScript for all code
- Follow functional programming principles where applicable
- Use neverthrow Result types for error handling in API
- Implement proper validation with Zod schemas
- Follow React best practices for components

### Database

- Use Drizzle ORM for database operations
- Write migrations for schema changes
- Follow naming conventions for tables and columns

### API Development

- Implement workflows for business logic
- Use proper HTTP status codes
- Validate all inputs with Zod
- Handle errors gracefully with neverthrow
- **Always run tests after making API changes**: `pnpm test:all`

### Frontend Development

- Use Remix conventions for routing and data loading
- Implement proper loading states
- Use React Aria Components for accessibility
- Follow component composition patterns

### Testing

- Write unit tests for business logic
- Test API endpoints
- Use Vitest for testing

## File Naming Conventions

### Backend

- Modules: lowercase with hyphens (`event-service.ts`)
- Workflows: descriptive names (`create-calendar.ts`)
- Schemas: domain-specific (`calendar-schema.ts`)

### Frontend

- Components: PascalCase (`EventDialog.tsx`)
- Routes: Remix conventions (`$calendarId.tsx`)
- Hooks: camelCase with `use` prefix (`useCalendar.ts`)
- Utilities: camelCase (`formatDate.ts`)

## Common Patterns

### Error Handling (Backend)

```typescript
import { ok, err, Result } from "neverthrow";

const workflow = (input: Input): Result<Output, Error> => {
  return validateInput(input).andThen(processData).andThen(saveToDatabase);
};
```

### API Client (Frontend)

```typescript
export const apiCall = async (data: Input): Promise<Output> => {
  const result = await apiClient.post<Output>("/endpoint", data);
  if (!result.ok) {
    return handleApiError(result.status);
  }
  return result.data;
};
```

### Component Pattern (Frontend)

```typescript
interface Props {
  // Define props clearly
}

export const Component: React.FC<Props> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  );
};
```

## Development Commands

### Setup

```bash
pnpm install                 # Install dependencies
```

### Development

```bash
pnpm dev:all                 # Start all apps in development (turbo run dev)
pnpm --filter ./apps/api dev # Start API only (wrangler dev)
pnpm --filter ./apps/web dev # Start web only (remix vite:dev)
```

### Database

```bash
pnpm --filter ./apps/api db:generate # Generate migrations
pnpm --filter ./apps/api db:migrate  # Run migrations
```

### Testing

```bash
pnpm test:all                        # Run all tests (turbo run test)
pnpm --filter ./apps/api test        # Run API tests (vitest run)
pnpm --filter ./apps/api test:watch  # Run API tests in watch mode (vitest)
```

### Quality Checks

```bash
pnpm check:all              # Run all quality checks (lint, format, typecheck)
```

### Package Management (pnpm workspace)

#### Installing Dependencies

```bash
# Install dependencies for all workspaces
pnpm install

# Add a dependency to a specific workspace
pnpm --filter ./apps/web add react-router
pnpm --filter ./apps/api add hono

# Add a dev dependency to a specific workspace
pnpm --filter ./apps/web add -D vite
pnpm --filter ./apps/api add -D typescript

# Add a dependency to the root workspace
pnpm add -w turbo

# Add a dependency to multiple workspaces
pnpm --filter "./apps/*" add dayjs
```

#### Managing Workspace Dependencies

```bash
# Use workspace protocol for internal dependencies
pnpm --filter ./apps/web add @yotei/eslint-config@workspace:*

# Remove a dependency from a specific workspace
pnpm --filter ./apps/web remove old-package

# Update dependencies in a specific workspace
pnpm --filter ./apps/web update

# Update all dependencies across all workspaces
pnpm update -r
```

#### Running Scripts Across Workspaces

```bash
# Run a script in a specific workspace
pnpm --filter ./apps/web dev
pnpm --filter ./apps/api test

# Run a script in all workspaces that have it
pnpm -r run build

# Run a script in multiple workspaces
pnpm --filter "./apps/*" run typecheck

# Run scripts with turbo (parallel execution)
turbo run dev          # Run dev script in all apps
turbo run build        # Run build script in all apps
turbo run test         # Run test script in all apps
```

#### Workspace Filtering Examples

```bash
# Filter by workspace name
pnpm --filter @yotei/web add react
pnpm --filter @yotei/api add hono

# Filter by directory path
pnpm --filter ./apps/web add react
pnpm --filter ./apps/api add hono

# Filter by glob pattern
pnpm --filter "./apps/*" add dayjs        # All apps
pnpm --filter "./packages/*" add typescript # All packages

# Filter with dependencies
pnpm --filter ...@yotei/web run build     # Build web and its dependencies
pnpm --filter @yotei/web^... run test     # Test web's dependencies
```

## Important Notes

1. **Always use pnpm** as the package manager
2. **Follow monorepo patterns** - shared configs are in packages/
3. **Use workspace dependencies** with `workspace:*` protocol for internal packages
4. **Use --filter flag** to target specific workspaces when installing packages
5. **Maintain type safety** throughout the application
6. **Handle errors properly** using Result types in API
7. **Follow Remix conventions** for data loading and mutations
8. **Use proper validation** with Zod schemas
9. **Implement accessibility** with React Aria Components

### pnpm Workspace Best Practices

- **Internal Dependencies**: Always use `workspace:*` protocol for internal package dependencies
- **Filtering**: Use `--filter` to target specific workspaces instead of navigating to directories
- **Root Dependencies**: Use `-w` flag when adding dependencies to the root workspace
- **Turbo Integration**: Prefer `turbo run` for running scripts across multiple workspaces
- **Dependency Updates**: Use `-r` flag to update dependencies recursively across all workspaces

## When Making Changes

### Adding New Features

1. Create appropriate modules in backend
2. Implement workflows and repositories
3. Add API routes with validation
4. Create frontend components and pages
5. Update types and models
6. Add proper error handling
7. Write tests

### Database Changes

1. Modify schema files
2. Generate migrations with Drizzle
3. Test migrations locally
4. Update related repositories and workflows

### API Changes

1. Update schemas and validation
2. Modify workflows as needed
3. Update frontend API client
4. Ensure proper error handling
5. Update types if necessary
6. **Run tests after API changes**: `pnpm test:all`

## Post-Development Workflow

After making any changes to the codebase, always run the quality checks to ensure code consistency and correctness:

```bash
pnpm check:all
```

This command runs:

- **Linting**: `turbo run lint:check` - Checks code style and potential issues
- **Formatting**: `turbo run format:check` - Verifies code formatting consistency
- **Type Checking**: `turbo run typecheck` - Validates TypeScript types across all packages

If any of these checks fail, fix the issues before considering the work complete.

Remember to maintain consistency with existing patterns and always prioritize type safety and proper error handling.
