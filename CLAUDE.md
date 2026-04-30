# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Monorepo for a pallet production control system:
- **backend/**: NestJS REST API (latest) with Prisma 7+ ORM and PostgreSQL
- **frontend/**: Next.js app with shadcn/ui and Tailwind CSS

Package manager: **npm**

## Commands

### Backend (backend/)

```bash
npm install                     # Install dependencies
npm run start:dev               # Dev server with hot reload
npm run build                   # Compile to dist/
npm run test                    # Unit tests
npm run test:e2e                # E2E tests
npm run lint                    # ESLint with auto-fix
npm run format                  # Prettier

# Prisma
npx prisma generate             # Generate client after schema changes
npx prisma migrate dev          # Create and apply migrations
npx prisma db push              # Push schema without migration
npx prisma validate             # Validate schema syntax

# Docker
docker-compose up               # Start API + PostgreSQL
docker-compose up --build       # Rebuild and start
```

### Frontend (frontend/)

```bash
npm install
npm run dev                     # Dev server
npm run build                   # Production build
```

## Architecture

### Backend
```
backend/
├── src/
│   ├── auth/                   # Authentication (JWT + Passport)
│   │   ├── guards/             # JwtAuthGuard (global), RoleGuard
│   │   ├── strategies/         # JWT strategy
│   │   └── dto/
│   ├── core/database/          # PrismaService extends PrismaClient
│   ├── modules/                # Feature modules
│   │   ├── users/
│   │   ├── pallets/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── order-items/
│   │   └── production-history/
│   └── shared/
│       ├── decorators/         # @IsPublic, @Roles, @User
│       └── exceptions/
├── prisma/schema.prisma
└── test/
```

### Frontend
```
frontend/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── layout/
│   │   └── shared/
│   ├── services/               # API client
│   ├── contexts/               # Auth context
│   ├── hooks/
│   └── lib/
└── public/
```

## Key Patterns

### Authentication & Authorization
- **Global JWT Guard**: Registered globally in `AuthModule`. All routes require auth by default.
- **Public routes**: Use `@IsPublic()` decorator to bypass auth (login, register).
- **Role-based access**: Use `@Roles(UserRole.ADMIN, ...)` decorator with `RoleGuard`.
- See `docs/user-roles.md` for full role permissions matrix.

### Soft Deletes
All entities have a nullable `deletedAt` field. When "deleting", set `deletedAt = new Date()`.
All queries should filter `where: { deletedAt: null }` unless explicitly including deleted records.

### Pallet Versioning
Pallets use a self-referencing FK `versionFromId`:
- `null` = original pallet (first version)
- Set = this pallet is a new version derived from another
- Small updates: edit the pallet in place
- New version: create a new Pallet record with `versionFromId` pointing to the original
- `version` int field + `@@unique([name, version])` ensures no duplicate name+version combos

### Prisma 7
- Config is in `backend/prisma.config.ts` (datasource URL defined here, NOT in schema.prisma)
- Generator uses `prisma-client` provider with `moduleFormat = "cjs"` and output to `src/generated/prisma`
- Requires `@prisma/adapter-pg` driver adapter for PrismaClient initialization
- PrismaClient must be initialized with the adapter:
  ```typescript
  import { PrismaClient } from '@generated/prisma';
  import { PrismaPg } from '@prisma/adapter-pg';
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  ```
- Generated client is at `src/generated/prisma` (gitignored, regenerate with `npx prisma generate`)

### Import Aliases
TypeScript path aliases are configured in `backend/tsconfig.json`:

| Alias | Maps to | Example |
|-------|---------|---------|
| `@generated/prisma` | `src/generated/prisma/client` | `import { User } from '@generated/prisma'` |
| `@modules/*` | `src/modules/*` | `import { UserEntity } from '@modules/users/entities/user.entity'` |
| `@shared/*` | `src/shared/*` | `import { User } from '@shared/decorators'` |
| `@core/*` | `src/core/*` | `import { PrismaService } from '@core/database/database.service'` |

Always use these aliases instead of `src/` relative paths.

### Module Structure
Each backend feature module follows:
```
modules/<name>/
├── entities/<name>.entity.ts      # Class implementing Prisma model
├── dto/
│   ├── create-<name>.dto.ts       # class-validator decorated
│   └── update-<name>.dto.ts       # PartialType(CreateDto)
├── services/
│   ├── create-<name>.service.ts   # One injectable per operation
│   ├── find-all-<name>s.service.ts
│   ├── find-one-<name>.service.ts
│   ├── update-<name>.service.ts
│   ├── remove-<name>.service.ts
│   └── index.ts                   # Barrel export
├── <name>.controller.ts           # Single controller, all routes
└── <name>.module.ts
```

### DTO Validation
Uses `class-validator` decorators. Custom decorators in `shared/decorators/` for common patterns.

## Environment Variables

### Backend (.env)
| Variable       | Description                        | Example                                      |
|----------------|------------------------------------|----------------------------------------------|
| `PORT`         | API port (host)                    | `3000`                                       |
| `DATABASE_URL` | PostgreSQL connection string       | `postgresql://user:pass@db:5432/pallets_db`  |
| `DB_PORT`      | Postgres port (host)               | `5432`                                       |
| `DB_USER`      | Postgres user                      | `pallets`                                    |
| `DB_PASSWORD`  | Postgres password                  | `pallets123`                                 |
| `DB_NAME`      | Database name                      | `pallets_db`                                 |
| `JWT_SECRET`   | Secret for JWT signing             | (random string)                              |
| `PWD_PEPPER`   | Password pepper for hashing        | (random string)                              |

## Domain Models

- **User**: Employees with roles (ADMIN, MANAGER, EMPLOYEE). Identified by `document` (CPF/CNPJ).
- **Pallet**: Product types with versioning (self-FK), pricing (buy, production, sell costs).
- **ProductionHistory**: Tracks employee pallet production - who produced what, how many, status.
- **Customer**: Order recipients with business/corporate name.
- **Order**: Customer orders with status workflow and deadline.
- **OrderItem**: Individual pallet items within an order with requested vs produced quantities.

### Enums
- **UserRole**: ADMIN, MANAGER, EMPLOYEE
- **ProductionStatus**: OPEN, REFORMED, CANCELED, PAID
- **OrderStatus**: OPEN, IN_PRODUCTION, DONE, CANCELED

## Design System (Frontend)

Colors (from original project):
- Background: `#FFF9F0` (cream)
- Card/Modal: `#EFDEC4` (tan)
- Primary: `#B8860B` (golden)
- Destructive: `#B8250B` (red)
- Secondary/Header: `#2C1F16` (dark brown)
- Font: Lato

Swagger docs available at `/docs` when API is running.

## Testing

### Mandatory Test Maintenance
Whenever backend code is added or modified (new service, controller, guard, exception, or changes to existing ones), **always check if tests need to be created or updated**:
- **New service/controller/guard**: Create a corresponding `.spec.ts` file following existing patterns.
- **Modified service/controller logic**: Update the existing `.spec.ts` to cover the new/changed behavior.
- **Run `npm run test` in `backend/`** after any code change to verify all tests still pass.

### Test Conventions
- Test files live alongside source files as `<name>.spec.ts`
- Shared PrismaService mock: `src/__mocks__/prisma.mock.ts`
- Use `@nestjs/testing` `Test.createTestingModule` for DI setup
- Use real `bcrypt` (not mocked) for password-related tests
- All service tests must verify soft delete filtering (`deletedAt: null`)
- All "not found" paths must verify `ObjectNotFoundException` is thrown
- Controller tests verify delegation to the correct service with correct args
- Call `jest.clearAllMocks()` in `beforeEach`
