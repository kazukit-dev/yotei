# Yotei

Modern calendar application built with TypeScript.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run dev:all
```

## Project Structure

````
yotei/
|-- apps/
|   |-- api/          # Backend API (Cloudflare Workers + Hono)
|   +-- web/          # Frontend (Remix + React)
|-- infra/            # Infrastructure (Terraform)
+-- packages/         # Shared packages```

## Development

```bash
# Development
pnpm run dev:all

# Quality checks
pnpm run check:all

# Testing
pnpm run test:all

# Fix formatting/linting
pnpm run fix:all
````

## Tech Stack

- **Backend**: Cloudflare Workers, Hono, PostgreSQL, Drizzle ORM
- **Frontend**: Remix, React, Tailwind CSS, React Aria Components
- **Infrastructure**: AWS, Terraform
- **Language**: TypeScript

## Requirements

- Node.js 22.16.0
- pnpm 10.0.0+

---
