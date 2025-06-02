# Yotei API Development Guidelines

## Technology Stack

### Runtime & Deployment

- **Runtime**: Cloudflare Workers (Edge Runtime)
- **Deployment**: Wrangler CLI
- **Language**: TypeScript (strict mode)

### Framework & Libraries

- **Web Framework**: Hono v4.7+
  - Lightweight, fast web framework optimized for edge runtime
  - Type-safe routing and middleware support
- **Database**: PostgreSQL with Drizzle ORM v0.44+
  - Type-safe SQL queries with excellent TypeScript integration
  - Migration management via Drizzle Kit
- **Authentication**: Jose (JWT handling)
- **Error Handling**: neverthrow v8.2+ (functional error handling)
- **Validation**: Zod v3.25+ with @hono/zod-validator
- **Date/Time**: dayjs v1.11+
- **Recurring Events**: RRule v2.8+ (RFC 5545 specification)

### Development Tools

- **Testing**: Vitest v3.1+
- **Linting**: ESLint v9+ with shared config
- **Formatting**: Prettier v3.5+
- **Package Manager**: pnpm (workspace:\* protocol)
- **Node Version**: 22.16.0 (managed by Volta)

## Architecture Patterns

### Domain-Driven Design

- **Module Structure**: Features organized by domain modules
  - `auth/` - Authentication & Authorization
  - `calendar/` - Calendar Management
  - `event/` - Event Management
  - `user/` - User Management

### Workflow Pattern

- **Business Logic**: Encapsulated in workflows using functional patterns
- **Pipeline**: Functional programming with Result types
- **Error Handling**: Type-safe error handling with neverthrow

### Repository Pattern

- **Data Access**: Repository layer abstracts database operations
- **Transactions**: Leverage Drizzle ORM transaction capabilities

### Directory Design Pattern

Each domain module follows a consistent structure with clear separation of concerns:

```
modules/
├── auth/
│   ├── api/           # HTTP routes and handlers
│   ├── objects/       # Domain objects and value objects
│   ├── query-services/# Read-only data access for queries
│   ├── repositories/  # Write operations and complex queries
│   ├── workflows/     # Business logic orchestration
│   └── middlewares/   # Domain-specific middleware
├── calendar/
│   ├── api/
│   ├── objects/
│   ├── query-services/
│   ├── repositories/
│   └── workflows/
└── event/
    ├── api/
    ├── objects/
    ├── query-services/
    ├── repositories/
    └── workflows/
```

#### Layer Responsibilities

- **`api/`**: HTTP route handlers, request/response mapping, validation schemas
- **`objects/`**: Domain entities, value objects, and business rules
- **`query-services/`**: Read-optimized data access for complex queries and DTOs
- **`repositories/`**: Write operations, simple queries, data persistence
- **`workflows/`**: Business logic orchestration, use case implementation

#### Detailed Layer Guidelines

**API Layer (`api/`)**

```typescript
// api/router.ts - Route definitions and handlers
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const app = new Hono();

app.post("/events", zValidator("json", createEventSchema), async (c) => {
  const input = c.req.valid("json");
  const workflow = createEventWorkflow();

  return await workflow(input).match(
    (data) => c.json(data, 201),
    (error) => {
      throw error;
    }
  );
});

// api/schema.ts - Request/response validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
});
```

**Objects Layer (`objects/`)**

```typescript
// objects/write/event.ts - Domain entities and business logic
export interface Event {
  id: EventId;
  title: Title;
  start: Date;
  end: Date;
  calendar_id: CalendarId;
  is_recurring: boolean;
}

// objects/write/title.ts - Value objects with validation
export const createTitle = (value: string): Result<Title, string> => {
  if (value.trim().length === 0) {
    return err("Title cannot be empty");
  }
  return ok(value.trim() as Title);
};
```

**Query Services Layer (`query-services/`)**

```typescript
// query-services/get-events.ts - Functional query service with curried dependencies
import { ResultAsync } from "neverthrow";
import type { DB } from "../../../db";
import type { EventDto, DateRange } from "../objects/read/event-dto";

export const getEventsByCalendar =
  (db: DB) =>
  (calendarId: string) =>
  (range: DateRange): ResultAsync<EventDto[], DBError> => {
    return ResultAsync.fromPromise(
      db.query.events.findMany({
        where: and(
          eq(events.calendar_id, calendarId),
          gte(events.start, range.from),
          lte(events.end, range.to)
        ),
        with: {
          rrule: true,
          exceptions: true,
        },
      }),
      (error) => new DBError("Failed to get events", { cause: error })
    );
  };

// Usage with curried dependencies
const getEvents = getEventsByCalendar(db);
const getCalendarEvents = getEvents(calendarId);
const result = await getCalendarEvents(dateRange);
```

**Repositories Layer (`repositories/`)**

```typescript
// repositories/save-created-event.ts - Functional repository with curried dependencies
import { ResultAsync } from "neverthrow";
import type { DB, Transaction } from "../../../db";
import type { Event, CreatedEvent } from "../objects/write/event";

// Curried function for dependency injection
export const saveCreatedEvent =
  (db: DB) =>
  (event: CreatedEvent): ResultAsync<Event, DBError> => {
    return ResultAsync.fromPromise(
      db.transaction(async (tx) => {
        const eventData: EventInsertModel = {
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        };

        await tx.insert(events).values(eventData);

        if (event.rrule) {
          await tx.insert(recurrenceRule).values({
            ...event.rrule,
            event_id: event.id,
          });
        }

        return event;
      }),
      (error) => new DBError("Failed to save event", { cause: error })
    );
  };

// Usage with dependency injection
const saveEvent = saveCreatedEvent(db);
const result = await saveEvent(newEvent);
```

**Workflows Layer (`workflows/`)**

```typescript
// workflows/create-event.ts - Functional workflow composition with curried dependencies
import { Result, ResultAsync, ok } from "neverthrow";
import type { DB } from "../../../db";

// Type definitions for workflow steps
type ValidateStep = (
  command: UnvalidatedCommand
) => Result<ValidatedCommand, ValidationError>;
type CreateEventStep = (
  validated: ValidatedCommand
) => Result<CreatedEvent, DomainError>;
type SaveEventStep = (event: CreatedEvent) => ResultAsync<Event, DBError>;
type PublishEventStep = (event: Event) => ResultAsync<Event, PublishError>;

// Curried workflow factory with dependency injection
export const createEventWorkflow =
  (deps: { db: DB; publisher: EventPublisher }) =>
  (command: UnvalidatedCommand): ResultAsync<Event, WorkflowError> => {
    const validate: ValidateStep = (cmd) => {
      return Result.combine([
        createTitle(cmd.title),
        createDateRange(cmd.start, cmd.end),
        createCalendarId(cmd.calendarId),
      ]).map(([title, dateRange, calendarId]) => ({
        ...cmd,
        title,
        start: dateRange.start,
        end: dateRange.end,
        calendarId,
        kind: "validated" as const,
      }));
    };

    const createEvent: CreateEventStep = (validated) => {
      return ok({
        ...validated,
        id: generateEventId(),
        createdAt: new Date(),
        kind: "created" as const,
      });
    };

    const saveEvent: SaveEventStep = saveCreatedEvent(deps.db);
    const publishEvent: PublishEventStep = publishCreatedEvent(deps.publisher);

    return ok(command)
      .andThen(validate)
      .andThen(createEvent)
      .asyncAndThen(saveEvent)
      .andThen(publishEvent);
  };

// Usage with dependency injection
const workflow = createEventWorkflow({ db, publisher });
const result = await workflow(command);
```

## Coding Standards

### Functional Programming with neverthrow

```typescript
import { ok, err, Result, ResultAsync } from "neverthrow";

// Always use Result types instead of throwing exceptions
const validateTitle = (title: string): Result<Title, ValidationError> => {
  if (title.trim().length === 0) {
    return err(new ValidationError("Title cannot be empty"));
  }
  return ok(title.trim() as Title);
};

// Compose operations using andThen
const workflow = (input: Input): ResultAsync<Output, WorkflowError> => {
  return ok(input)
    .andThen(validateInput)
    .andThen(processData)
    .asyncAndThen(saveToDatabase)
    .andThen(publishResult);
};
```

### Curried Dependency Injection

```typescript
// Repository function with curried dependencies
export const findEventById =
  (
    db: DB // First curry: inject dependency
  ) =>
  (eventId: EventId): ResultAsync<Event | null, DBError> => {
    // Second curry: actual parameters
    return ResultAsync.fromPromise(
      db.query.events.findFirst({
        where: eq(events.id, eventId),
      }),
      (error) => new DBError("Failed to find event", { cause: error })
    );
  };

// Usage: inject dependency first, then use function
const findEvent = findEventById(db);
const result = await findEvent(eventId);

// Workflow with multiple dependencies
export const createEventWorkflow =
  (deps: { db: DB; publisher: EventPublisher }) =>
  (command: CreateEventCommand): ResultAsync<Event, WorkflowError> => {
    const saveEvent = saveCreatedEvent(deps.db);
    const publishEvent = publishCreatedEvent(deps.publisher);

    return validateCommand(command)
      .andThen(createEvent)
      .asyncAndThen(saveEvent)
      .andThen(publishEvent);
  };
```

### Function-Based Repository Pattern

```typescript
// Instead of class-based repository
interface EventRepository {
  findById(id: EventId): Promise<Event | null>;
  save(event: Event): Promise<void>;
}

// Use curried functions
export const findEventById =
  (db: DB) =>
  (eventId: EventId): ResultAsync<Event | null, DBError> => {
    // Implementation
  };

export const saveEvent =
  (db: DB) =>
  (event: Event): ResultAsync<void, DBError> => {
    // Implementation
  };

// Module-level dependency injection
export const createEventRepository = (db: DB) => ({
  findById: findEventById(db),
  save: saveEvent(db),
});
```

### Validation

```typescript
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// Schema definition
const createEventSchema = z.object({
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

// Route with validation
app.post("/events", zValidator("json", createEventSchema), async (c) => {
  const input = c.req.valid("json"); // Type-safe validated input
  // ... processing
});
```

### Functional Composition Patterns

```typescript
// Compose multiple validation steps
const validateEventData = (
  data: UnvalidatedEvent
): Result<ValidatedEvent, ValidationError[]> => {
  return Result.combine([
    validateTitle(data.title),
    validateDateRange(data.start, data.end),
    validateCalendarId(data.calendarId),
  ]).map(([title, dateRange, calendarId]) => ({
    ...data,
    title,
    start: dateRange.start,
    end: dateRange.end,
    calendarId,
  }));
};

// Chain async operations with ResultAsync
const processEvent =
  (deps: Dependencies) =>
  (event: ValidatedEvent): ResultAsync<ProcessedEvent, ProcessingError> => {
    return checkPermissions(deps.authService)(event.calendarId)
      .andThen(() => enrichEventData(deps.calendarService)(event))
      .andThen(applyBusinessRules);
  };
```

### Workflow Implementation

```typescript
type Workflow = (
  command: UnvalidatedCommand
) => Result<ProcessedData, WorkflowError>;

const workflow: Workflow = (command) => {
  return ok(command)
    .andThen(validate)
    .andThen(processBusinessLogic)
    .andThen(createResult);
};
```

## Naming Conventions

### Files & Directories

- **Modules**: kebab-case (`event-service.ts`)
- **Workflows**: verb-based (`create-calendar.ts`)
- **Repositories**: purpose-specific (`save-created-event.ts`)
- **Schemas**: domain-specific (`calendar-schema.ts`)

### Type Definitions

- **Types**: PascalCase (`CreateEventCommand`)
- **Interfaces**: PascalCase (`EventRepository`)
- **Enums**: PascalCase (`EventStatus`)

### Functions & Variables

- **Functions**: camelCase (`createEvent`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EVENT_DURATION`)
- **Variables**: camelCase (`eventData`)

## Database Guidelines

### Drizzle ORM

```typescript
// Schema definition
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Type-safe queries
const event = await db.query.events.findFirst({
  where: eq(events.id, eventId),
});
```

### Migration Management

```bash
# Generate migration
pnpm --filter ./apps/api db:generate

# Apply migration
pnpm --filter ./apps/api db:migrate
```

## API Design Guidelines

### RESTful API Design

- **Resource-based URLs**: `/calendars/:calendarId/events`
- **HTTP Methods**: Use appropriate HTTP methods
- **Status Codes**: Follow standard HTTP status codes

### Error Response Handling

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
  }
}

// Usage in route
.match(
  (data) => c.json(data, 201),
  (error) => {
    if (error instanceof ValidationError) {
      return c.json({ message: error.message }, 400);
    }
    throw error; // Let error handler catch it
  }
);
```

### Middleware Implementation

```typescript
import { createMiddleware } from "hono/factory";

export const authenticate = createMiddleware<AuthenticatedEnv>(
  async (c, next) => {
    // Authentication logic
    const userId = await validateSession(c);
    c.set("userId", userId);
    await next();
  }
);
```

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";

describe("createEventWorkflow", () => {
  it("should create event successfully", () => {
    const result = createEventWorkflow()(validInput);
    expect(result.isOk()).toBe(true);
  });
});
```

### Test Commands

```bash
# Run all tests
pnpm --filter ./apps/api test

# Run tests in watch mode
pnpm --filter ./apps/api test:watch

# ⚠️ Critical: Always run tests after API changes
pnpm test:all
```

### Post-Development Validation

After making any changes to the API code, always run these commands to ensure code quality:

```bash
# API-specific testing and validation
pnpm run test:api     # Run API tests only
pnpm run check:api    # Run linting, formatting, and type checking for API

# Alternative: Run individual checks
pnpm --filter ./apps/api test
pnpm --filter ./apps/api validate
```

**Critical Workflow**: After any API changes, execute both commands:

1. `pnpm run test:api` - Ensures all tests pass
2. `pnpm run check:api` - Validates code quality (lint, format, typecheck)

## Development Workflow

### Feature Development Process

1. **Domain Objects**: Define value objects and entities
2. **Schemas**: Create Zod validation schemas
3. **Workflows**: Implement business logic workflows
4. **Repositories**: Build data access layer
5. **API Routes**: Create API endpoints
6. **Tests**: Write comprehensive unit tests
7. **⚠️ Validation**: Run `pnpm run test:api && pnpm run check:api`

### Development Cycle

```bash
# During development
pnpm --filter ./apps/api dev

# After making changes - MANDATORY
pnpm run test:api     # Verify tests pass
pnpm run check:api    # Verify code quality

# Before committing
pnpm test:all         # Run all tests (optional but recommended)
```

### Quality Assurance

```bash
# Run all quality checks
pnpm --filter ./apps/api validate

# Individual checks
pnpm --filter ./apps/api lint:check
pnpm --filter ./apps/api format:check
pnpm --filter ./apps/api typecheck

# Workspace-level commands (recommended for API changes)
pnpm run check:api    # Runs lint:check, format:check, typecheck for API
pnpm run test:api     # Runs tests for API only
```

### Mandatory Post-Change Workflow

When making changes to API code, follow this mandatory workflow:

```bash
# 1. Run API tests
pnpm run test:api

# 2. Run API quality checks
pnpm run check:api

# 3. If all pass, your changes are ready
# 4. If any fail, fix issues and repeat
```

This ensures:

- All existing functionality continues to work
- Code follows project standards
- TypeScript compilation succeeds
- No linting or formatting issues

## Important Guidelines

### Error Handling Guidelines

- **Never throw exceptions**: Always use neverthrow Result types
- **Define clear error hierarchies**: Create specific error types for different domains
- **Provide meaningful error messages**: Include context and actionable information
- **Handle edge cases gracefully**: Use Result.combine for multiple validations
- **Chain operations safely**: Use andThen for sequential operations

### Functional Programming Guidelines

- **Pure functions over classes**: Implement business logic as pure functions
- **Currying for dependency injection**: Use curried functions instead of interfaces
- **Immutable data structures**: Avoid mutations, create new objects
- **Function composition**: Chain operations using Result.andThen patterns
- **Type safety**: Leverage TypeScript's type system with neverthrow

### Performance Considerations

- Consider Cloudflare Workers runtime constraints
- Avoid unnecessary database queries
- Implement proper database indexing
- Use connection pooling effectively
- Optimize for cold start performance

### Functional Programming Best Practices

- **Use neverthrow for all error handling**: Avoid throwing exceptions, use Result types
- **Implement functions, not classes**: Prefer pure functions over object-oriented patterns
- **Curry dependencies for DI**: Use currying for dependency injection instead of interfaces
- **Repository pattern with functions**: Implement repositories as curried functions, not objects
- **Compose workflows functionally**: Chain operations using Result.andThen patterns

### Security Best Practices

- Validate all input data with Zod schemas
- Implement proper authentication and authorization
- Use parameterized queries (handled by Drizzle ORM)
- Apply rate limiting where appropriate
- Sanitize output data

### Development Efficiency

- **Prioritize functional programming**: Use pure functions and Result types
- **Leverage currying for DI**: Implement dependency injection through currying
- **Create reusable functional utilities**: Build composable function libraries
- **Maintain comprehensive documentation**: Document function signatures and error types
- **Follow consistent functional patterns**: Use consistent Result handling patterns
- **Use meaningful variable and function names**: Clear naming for functional composition

<!-- Generated by Copilot -->
