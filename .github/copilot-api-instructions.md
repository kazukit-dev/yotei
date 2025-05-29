# AlphaHelixer API abstract

## Used library

1. hono
2. neverthrow (ref: https://github.com/supermacro/neverthrow)
3. drizzle-orm (ref: https://github.com/drizzle-team/drizzle-orm)

## Directory

```
apps/api/src/modules/
└── moduleA/
    ├── workflows/         # Business logic and use cases
    ├── objects/           # Domain models and entities
    ├── query-services/    # Data query and retrieval services
    ├── repositories/      # Data access layer interfaces
    ├── api/
    │   ├── router.ts      # API route definitions using Hono
    │   └── schema.ts      # Request/response validation schemas
    └── middlewares/       # Custom middleware functions
```

### Directory Structure Description

#### Workflows directory

Contains business logic and use case implementations.
Defined using Railway Programming with Neverthrow. Each function receives a command and returns a command.

Example:

```js
    type CommandA = {
        kind: 'unvalidated'
        input: {
            foo: string;
            bar: number
        }
    }

    type CommandA = {
        kind: 'validated'
        input: {
            foo: Foo;
            bar: Bar
        }
    }
    type Validate = (command: CommandA) => Result<CommandB, ValidationError>
```

Each function follows the single responsibility principle and performs only one specific task. Functions are chained together using `andThen`, `asyncThen`, and other composition methods to create complete workflows.

Example workflow composition:

```js
const processUserRegistration = (command: UnvalidatedUserCommand) =>
  validateUserInput(command)
    .andThen(checkUserExists)
    .asyncThen(hashPassword)
    .asyncThen(saveUser)
    .andThen(generateWelcomeEmail);
```

This approach ensures:

- Clear separation of concerns
- Easy testing of individual steps
- Composable and reusable functions
- Type-safe error handling through the Result type

#### Objects directory

Domain models, entities, and data structures
Contains domain rules and business validations. Uses Neverthrow's Result type for error handling. Validation errors are returned as string type.

Example:

```js
type User = {
  id: UserId,
  email: Email,
  age: Age,
};

type CreateUser = (email: string, age: number) => Result<User, string>;

const createUser: CreateUser = (email, age) => {
  return validateEmail(email)
    .andThen(() => validateAge(age))
    .map(() => ({
      id: generateUserId(),
      email: Email.create(email),
      age: Age.create(age),
    }));
};

const validateEmail = (email: string): Result<void, string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? ok(undefined) : err("Invalid email format");
};

const validateAge = (age: number): Result<void, string> => {
  return age >= 0 && age <= 150
    ? ok(undefined)
    : err("Age must be between 0 and 150");
};
```

Domain objects encapsulate business rules and ensure data integrity through validation at creation time.

#### Query-services directory

Services responsible for data querying and retrieval operations

Services for simple data retrieval operations that don't require domain logic. Most GET operations fall into this category, where data is directly fetched from the database and returned to the client without applying domain rules or complex business logic.

Example:
xxxx

These services focus on efficient data retrieval and transformation for presentation purposes, bypassing complex domain validations that are typically required for write operations. All operations use Neverthrow's Result type for consistent error handling.

#### Repository directory

Data access layer with repository pattern implementations

Data access layer interfaces and implementations for persistent storage operations

Most write operations involve domain logic validation before database persistence. Repositories handle the interaction between domain objects (defined in the objects directory) and the database layer. They use custom types from the objects directory and leverage Neverthrow's Result type for error handling.

Example:
xxxx

Repositories abstract database operations and ensure that domain objects maintain their integrity when persisting to or retrieving from storage.

#### Api directory

`router.ts`: Route handlers and endpoint definitions using Hono framework
`schema.ts`: Input validation and response schemas

#### Middleware directory

Custom middleware functions for request processing
