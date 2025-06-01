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
pnpm dev:all                # Start all apps in development
pnpm --filter ./apps/api dev # Start API only
pnpm --filter ./apps/web dev # Start web only
```

### Database

```bash
pnpm --filter ./apps/api db:generate # Generate migrations
pnpm --filter ./apps/api db:migrate  # Run migrations
```

### Testing

```bash
pnpm --filter ./apps/api test        # Run API tests
```

### Quality Checks

```bash
pnpm check:all              # Run all quality checks (lint, format, typecheck)
```

## Important Notes

1. **Always use pnpm** as the package manager
2. **Follow monorepo patterns** - shared configs are in packages/
3. **Use workspace dependencies** with `workspace:*` protocol
4. **Maintain type safety** throughout the application
5. **Handle errors properly** using Result types in API
6. **Follow Remix conventions** for data loading and mutations
7. **Use proper validation** with Zod schemas
8. **Implement accessibility** with React Aria Components

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
